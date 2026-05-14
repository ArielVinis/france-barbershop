-- organization.updatedAt pode não existir em bases antigas do plugin
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Sincroniza identidade da barbearia para Organization (fonte de verdade)
UPDATE "organization" AS o
SET
  name = b.name,
  slug = b.slug,
  logo = b."imageUrl"
FROM "Barbershop" AS b
WHERE b."organizationId" = o.id;

-- Barbearias sem organização: cria organization e associa
DO $$
DECLARE
  r RECORD;
  new_id TEXT;
BEGIN
  FOR r IN
    SELECT id, name, slug, "imageUrl"
    FROM "Barbershop"
    WHERE "organizationId" IS NULL
  LOOP
    new_id := gen_random_uuid()::text;
    INSERT INTO "organization" (id, name, slug, logo, "createdAt", "updatedAt", "metadata")
    VALUES (new_id, r.name, r.slug, r."imageUrl", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);
    UPDATE "Barbershop"
    SET "organizationId" = new_id
    WHERE id = r.id;
  END LOOP;
END $$;

-- Remove colunas duplicadas em Barbershop
ALTER TABLE "Barbershop" DROP COLUMN IF EXISTS "name";
ALTER TABLE "Barbershop" DROP COLUMN IF EXISTS "slug";
ALTER TABLE "Barbershop" DROP COLUMN IF EXISTS "imageUrl";

-- organizationId obrigatório
ALTER TABLE "Barbershop" ALTER COLUMN "organizationId" SET NOT NULL;

-- FK: não permitir apagar organization se existir barbearia
ALTER TABLE "Barbershop" DROP CONSTRAINT IF EXISTS "Barbershop_organizationId_fkey";
ALTER TABLE "Barbershop"
ADD CONSTRAINT "Barbershop_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Índice único de slug deixou de existir em Barbershop (slug fica só em organization)
DROP INDEX IF EXISTS "Barbershop_slug_key";
