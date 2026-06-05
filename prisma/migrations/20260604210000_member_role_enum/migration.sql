-- Alinhar enum Role ao schema Prisma e converter Member.role de TEXT (Better Auth) para enum.

BEGIN;

CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'MEMBER', 'OWNER', 'MANAGER', 'CLIENT');

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING (
  CASE "role"::text
    WHEN 'BARBER' THEN 'MEMBER'::"Role_new"
    WHEN 'DEV' THEN 'ADMIN'::"Role_new"
    ELSE "role"::text::"Role_new"
  END
);

ALTER TABLE "Member" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Member" ALTER COLUMN "role" TYPE "Role_new" USING (
  CASE lower("role")
    WHEN 'member' THEN 'MEMBER'::"Role_new"
    WHEN 'owner' THEN 'OWNER'::"Role_new"
    WHEN 'admin' THEN 'ADMIN'::"Role_new"
    WHEN 'manager' THEN 'MANAGER'::"Role_new"
    WHEN 'client' THEN 'CLIENT'::"Role_new"
    WHEN 'barber' THEN 'MEMBER'::"Role_new"
    WHEN 'dev' THEN 'ADMIN'::"Role_new"
    ELSE upper("role")::"Role_new"
  END
);

ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CLIENT';
ALTER TABLE "Member" ALTER COLUMN "role" SET DEFAULT 'MEMBER';

ALTER TABLE "Member"
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

COMMIT;
