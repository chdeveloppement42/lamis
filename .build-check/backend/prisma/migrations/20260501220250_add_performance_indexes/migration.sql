-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_PROVIDER', 'NEW_LISTING', 'SENSITIVE_DATA_CHANGE', 'CONTACT_MESSAGE', 'SYSTEM');

-- AlterTable: safe cast from text to enum — preserves all existing notification rows
ALTER TABLE "Notification"
  ALTER COLUMN "type" TYPE "NotificationType"
  USING "type"::"NotificationType";

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_providerId_idx" ON "Listing"("providerId");

-- CreateIndex
CREATE INDEX "Listing_categoryId_idx" ON "Listing"("categoryId");

-- CreateIndex
CREATE INDEX "Listing_city_idx" ON "Listing"("city");

-- CreateIndex
CREATE INDEX "Listing_status_categoryId_idx" ON "Listing"("status", "categoryId");

-- CreateIndex
CREATE INDEX "Notification_adminId_isRead_idx" ON "Notification"("adminId", "isRead");

-- CreateIndex
CREATE INDEX "Provider_status_idx" ON "Provider"("status");
