-- 1) Campos de perfil da barbearia em organization
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "phones" TEXT[];
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "description" TEXT;

UPDATE "organization" AS o
SET
  "address" = b."address",
  "phones" = b."phones",
  "description" = b."description"
FROM "Barbershop" AS b
WHERE b."organizationId" = o.id;

UPDATE "organization"
SET
  "address" = COALESCE("address", ''),
  "phones" = COALESCE("phones", ARRAY[]::TEXT[]),
  "description" = COALESCE("description", '')
WHERE "address" IS NULL;

ALTER TABLE "organization" ALTER COLUMN "address" SET NOT NULL;
ALTER TABLE "organization" ALTER COLUMN "phones" SET NOT NULL;
ALTER TABLE "organization" ALTER COLUMN "description" SET NOT NULL;

-- 2) organizationId nas tabelas filhas (antes de remover Barbershop)
ALTER TABLE "BarbershopService" ADD COLUMN "organizationId" TEXT;

UPDATE "BarbershopService" AS s
SET "organizationId" = b."organizationId"
FROM "Barbershop" AS b
WHERE b.id = s."barbershopId";

ALTER TABLE "BarbershopService" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "BarbershopService" DROP CONSTRAINT IF EXISTS "BarbershopService_barbershopId_fkey";
ALTER TABLE "BarbershopService" DROP COLUMN "barbershopId";
ALTER TABLE "BarbershopService"
ADD CONSTRAINT "BarbershopService_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BarbershopService" RENAME TO "organization_service";

ALTER TABLE "BarbershopSchedule" ADD COLUMN "organizationId" TEXT;

UPDATE "BarbershopSchedule" AS s
SET "organizationId" = b."organizationId"
FROM "Barbershop" AS b
WHERE b.id = s."barbershopId";

ALTER TABLE "BarbershopSchedule" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "BarbershopSchedule" DROP CONSTRAINT IF EXISTS "BarbershopSchedule_barbershopId_fkey";
DROP INDEX IF EXISTS "BarbershopSchedule_barbershopId_dayOfWeek_key";
ALTER TABLE "BarbershopSchedule" DROP COLUMN "barbershopId";
ALTER TABLE "BarbershopSchedule"
ADD CONSTRAINT "BarbershopSchedule_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "organization_schedule_organizationId_dayOfWeek_key"
ON "BarbershopSchedule"("organizationId", "dayOfWeek");
ALTER TABLE "BarbershopSchedule" RENAME TO "organization_schedule";

ALTER TABLE "BarbershopBreak" ADD COLUMN "organizationId" TEXT;

UPDATE "BarbershopBreak" AS s
SET "organizationId" = b."organizationId"
FROM "Barbershop" AS b
WHERE b.id = s."barbershopId";

ALTER TABLE "BarbershopBreak" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "BarbershopBreak" DROP CONSTRAINT IF EXISTS "BarbershopBreak_barbershopId_fkey";
ALTER TABLE "BarbershopBreak" DROP COLUMN "barbershopId";
ALTER TABLE "BarbershopBreak"
ADD CONSTRAINT "BarbershopBreak_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BarbershopBreak" RENAME TO "organization_break";

ALTER TABLE "Rating" ADD COLUMN "organizationId" TEXT;

UPDATE "Rating" AS r
SET "organizationId" = b."organizationId"
FROM "Barbershop" AS b
WHERE b.id = r."barbershopId";

ALTER TABLE "Rating" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "Rating" DROP CONSTRAINT IF EXISTS "Rating_barbershopId_fkey";
ALTER TABLE "Rating" DROP COLUMN "barbershopId";
ALTER TABLE "Rating"
ADD CONSTRAINT "Rating_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3) Bloqueios: migrar se a tabela antiga existir; senão criar vazia
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'BarbershopBlockedSlot'
  ) THEN
    ALTER TABLE "BarbershopBlockedSlot" ADD COLUMN IF NOT EXISTS "organizationId" TEXT;

    UPDATE "BarbershopBlockedSlot" AS s
    SET "organizationId" = b."organizationId"
    FROM "Barbershop" AS b
    WHERE b.id = s."barbershopId";

    ALTER TABLE "BarbershopBlockedSlot" ALTER COLUMN "organizationId" SET NOT NULL;
    ALTER TABLE "BarbershopBlockedSlot" DROP CONSTRAINT IF EXISTS "BarbershopBlockedSlot_barbershopId_fkey";
    ALTER TABLE "BarbershopBlockedSlot" DROP COLUMN "barbershopId";
    ALTER TABLE "BarbershopBlockedSlot"
    ADD CONSTRAINT "BarbershopBlockedSlot_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    ALTER TABLE "BarbershopBlockedSlot" RENAME TO "organization_blocked_slot";
  ELSE
    CREATE TABLE "organization_blocked_slot" (
      "id" TEXT NOT NULL,
      "organizationId" TEXT NOT NULL,
      "startAt" TIMESTAMP(3) NOT NULL,
      "endAt" TIMESTAMP(3) NOT NULL,
      "reason" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "organization_blocked_slot_pkey" PRIMARY KEY ("id")
    );
    ALTER TABLE "organization_blocked_slot"
    ADD CONSTRAINT "organization_blocked_slot_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 4) Tabela legada de donos (pré Better Auth org)
DROP TABLE IF EXISTS "_OwnerBarbershops";

-- 5) Remover entidade Barbershop
DROP TABLE IF EXISTS "Barbershop";
