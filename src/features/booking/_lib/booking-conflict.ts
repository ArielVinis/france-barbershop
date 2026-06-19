import { addMinutes, endOfDay, startOfDay } from "date-fns"
import type { BookingStatus } from "@/prisma/generated/prisma/client"
import type { Prisma } from "@/prisma/generated/prisma/client"

export const BLOCKING_BOOKING_STATUSES: BookingStatus[] = [
  "CONFIRMED",
  "IN_PROGRESS",
]

type BookingWithDuration = {
  date: Date
  service: { durationMinutes: number }
}

export function bookingsOverlap(
  startA: Date,
  durationMinutesA: number,
  startB: Date,
  durationMinutesB: number,
): boolean {
  const endA = addMinutes(startA, durationMinutesA)
  const endB = addMinutes(startB, durationMinutesB)
  return startA < endB && endA > startB
}

export function findOverlappingBooking(
  candidateStart: Date,
  candidateDurationMinutes: number,
  existingBookings: BookingWithDuration[],
): BookingWithDuration | undefined {
  return existingBookings.find((booking) =>
    bookingsOverlap(
      candidateStart,
      candidateDurationMinutes,
      booking.date,
      booking.service.durationMinutes,
    ),
  )
}

type TransactionClient = Prisma.TransactionClient

export async function assertNoBarberBookingConflict(
  tx: TransactionClient,
  memberId: string,
  date: Date,
  durationMinutes: number,
  excludeBookingId?: string,
): Promise<void> {
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)

  await tx.$queryRaw`
    SELECT id FROM "Booking"
    WHERE "memberId" = ${memberId}
      AND status IN ('CONFIRMED', 'IN_PROGRESS')
      AND date >= ${dayStart}
      AND date <= ${dayEnd}
    FOR UPDATE
  `

  const existingBookings = await tx.booking.findMany({
    where: {
      memberId,
      status: { in: BLOCKING_BOOKING_STATUSES },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      date: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
    select: {
      date: true,
      service: { select: { durationMinutes: true } },
    },
  })

  const conflict = findOverlappingBooking(
    date,
    durationMinutes,
    existingBookings,
  )

  if (conflict) {
    throw new Error("Este horário não está mais disponível para o barbeiro")
  }
}
