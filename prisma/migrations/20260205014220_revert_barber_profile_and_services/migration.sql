/*
  Warnings:

  - You are about to drop the column `bio` on the `Barber` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Barber` table. All the data in the column will be lost.
  - You are about to drop the column `isAvailable` on the `Barber` table. All the data in the column will be lost.
  - You are about to drop the `BarberService` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BarberService" DROP CONSTRAINT "BarberService_barberId_fkey";

-- DropForeignKey
ALTER TABLE "BarberService" DROP CONSTRAINT "BarberService_serviceId_fkey";

-- AlterTable
ALTER TABLE "Barber" DROP COLUMN "bio",
DROP COLUMN "imageUrl",
DROP COLUMN "isAvailable";

-- DropTable
DROP TABLE "BarberService";
