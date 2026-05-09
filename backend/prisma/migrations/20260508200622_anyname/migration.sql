/*
  Warnings:

  - You are about to drop the column `city` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Provider` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('VENTE', 'LOCATION');

-- DropIndex
DROP INDEX "Listing_city_idx";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "city",
DROP COLUMN "district",
ADD COLUMN     "commune" TEXT,
ADD COLUMN     "floor" INTEGER,
ADD COLUMN     "quartier" TEXT,
ADD COLUMN     "rooms" INTEGER,
ADD COLUMN     "surface" DOUBLE PRECISION,
ADD COLUMN     "type" "ListingType" NOT NULL DEFAULT 'VENTE',
ADD COLUMN     "wilaya" TEXT;

-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "address",
ADD COLUMN     "commune" TEXT,
ADD COLUMN     "quartier" TEXT,
ADD COLUMN     "wilaya" TEXT;

-- CreateIndex
CREATE INDEX "Listing_wilaya_idx" ON "Listing"("wilaya");
