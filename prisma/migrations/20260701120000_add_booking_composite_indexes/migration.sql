-- DropIndex
DROP INDEX IF EXISTS "Booking_memberId_idx";

-- CreateIndex
CREATE INDEX "Booking_memberId_date_status_idx" ON "Booking"("memberId", "date", "status");

-- CreateIndex
CREATE INDEX "Booking_serviceId_date_idx" ON "Booking"("serviceId", "date");

-- CreateIndex
CREATE INDEX "Booking_userId_date_status_idx" ON "Booking"("userId", "date", "status");
