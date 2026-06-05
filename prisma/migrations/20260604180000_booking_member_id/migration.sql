-- Agendamento vinculado ao barbeiro (Member com role MEMBER)
ALTER TABLE "Booking" ADD COLUMN "memberId" TEXT;

ALTER TABLE "Booking"
ADD CONSTRAINT "Booking_memberId_fkey"
FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Booking_memberId_idx" ON "Booking"("memberId");
