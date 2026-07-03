import { addMinutes } from "date-fns"
import type { BookingStatus } from "@/prisma/generated/prisma/client"
import type { Prisma } from "@/prisma/generated/prisma/client"
import { Prisma as PrismaNamespace } from "@/prisma/generated/prisma/client"
import {
  bookingOverlapsBlockedSlot,
  bookingOverlapsBreak,
  isBookingWithinDaySchedule,
} from "@/src/shared/lib/schedule-utils"
import { getZonedDayBounds, getZonedDayOfWeek } from "@/src/shared/lib/timezone-utils"

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

export async function assertNoOrganizationScheduleConflict(
  tx: TransactionClient,
  organizationId: string,
  date: Date,
  durationMinutes: number,
): Promise<void> {
  if (date < new Date()) {
    throw new Error("Este horário já passou")
  }

  const dayOfWeek = getZonedDayOfWeek(date)
  const { start: dayStart, end: dayEnd } = getZonedDayBounds(date)

  const organization = await tx.organization.findUnique({
    where: { id: organizationId },
    select: {
      schedules: {
        where: { dayOfWeek },
        take: 1,
      },
      breaks: {
        where: { dayOfWeek },
      },
      blockedSlots: {
        where: {
          startAt: { lte: dayEnd },
          endAt: { gte: dayStart },
        },
      },
    },
  })

  if (!organization) {
    throw new Error("Organização não encontrada")
  }

  const schedule = organization.schedules[0] ?? null

  if (!isBookingWithinDaySchedule(date, durationMinutes, schedule)) {
    throw new Error("Fora do horário de funcionamento")
  }

  if (
    bookingOverlapsBreak(
      date,
      durationMinutes,
      organization.breaks.map((b) => ({
        startTime: b.startTime,
        endTime: b.endTime,
      })),
    )
  ) {
    throw new Error("Horário conflita com pausa da barbearia")
  }

  const overlapsBlock = organization.blockedSlots.some((slot) =>
    bookingOverlapsBlockedSlot(date, durationMinutes, {
      startAt: slot.startAt,
      endAt: slot.endAt,
    }),
  )

  if (overlapsBlock) {
    throw new Error("Horário indisponível por bloqueio da barbearia")
  }
}

type LockedBookingRow = {
  date: Date
  durationMinutes: number
}

export async function assertNoBarberBookingConflict(
  tx: TransactionClient,
  memberId: string,
  date: Date,
  durationMinutes: number,
  excludeBookingId?: string,
): Promise<void> {
  const { start: dayStart, end: dayEnd } = getZonedDayBounds(date)

  const existingBookings = await tx.$queryRaw<LockedBookingRow[]>`
    SELECT b.date, s."durationMinutes" AS "durationMinutes"
    FROM "Booking" b
    INNER JOIN "OrganizationService" s ON b."serviceId" = s.id
    WHERE b."memberId" = ${memberId}
      AND b.status IN ('CONFIRMED', 'IN_PROGRESS')
      AND b.date >= ${dayStart}
      AND b.date <= ${dayEnd}
      ${
        excludeBookingId
          ? PrismaNamespace.sql`AND b.id <> ${excludeBookingId}`
          : PrismaNamespace.empty
      }
    FOR UPDATE OF b
  `

  const conflict = findOverlappingBooking(
    date,
    durationMinutes,
    existingBookings.map((booking) => ({
      date: booking.date,
      service: { durationMinutes: booking.durationMinutes },
    })),
  )

  if (conflict) {
    throw new Error("Este horário não está mais disponível para o barbeiro")
  }
}
