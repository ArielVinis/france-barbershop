-- Ativar/desativar barbeiros (staff) na organização sem alterar o papel OWNER/MANAGER.
ALTER TABLE "member" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
