"use server"

import { revalidatePath } from "next/cache"
import type { BookingStatus } from "@/prisma/generated/prisma/client"
import { bookingService } from "@/src/features/booking/booking.service"
import type {
  OwnerBookingsPeriod,
  UpdateBookingStatusOptions,
} from "@/src/features/booking/booking.types"
import { getCurrentUser } from "@/src/server/auth/users"
import { PATHS } from "@/src/shared/constants/PATHS"
import { requireBarberForSession } from "@/src/shared/guards/require-barber-for-session"
import type { OwnerOrganizationIdList } from "@/src/shared/types/panel-data-scope"

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  options?: UpdateBookingStatusOptions,
) {
  const barber = await requireBarberForSession()

  await bookingService.updateBookingStatus(
    bookingId,
    barber.id,
    status,
    options,
  )

  revalidatePath(PATHS.PANEL.SCHEDULE)
  revalidatePath(PATHS.PANEL.ROOT)
}

export async function updateBookingStatusOwner(
  bookingId: string,
  status: BookingStatus,
  options?: UpdateBookingStatusOptions,
) {
  const { user } = await getCurrentUser()

  await bookingService.updateBookingStatusOwner(
    bookingId,
    user.id,
    status,
    options,
  )

  revalidatePath(PATHS.PANEL.ROOT)
}

export async function rescheduleBookingOwner(
  bookingId: string,
  newDate: Date,
  barberId?: string | null,
) {
  const { user } = await getCurrentUser()

  await bookingService.rescheduleBookingOwner(
    bookingId,
    user.id,
    newDate,
    barberId,
  )

  revalidatePath(PATHS.PANEL.ROOT)
}

export async function getOwnerBookings(
  organizationIds: OwnerOrganizationIdList,
  options: {
    organizationId?: string | null
    memberId?: string | null
    period: OwnerBookingsPeriod
    date: Date
  },
) {
  return bookingService.getOwnerBookings(organizationIds, options)
}

export async function getBarberBookings(
  memberId: string,
  period: OwnerBookingsPeriod,
  date: Date,
) {
  return bookingService.getBarberBookings(memberId, period, date)
}

export async function getOwnerScheduleBookings(
  organizationIds: OwnerOrganizationIdList,
  options: {
    organizationId?: string | null
    memberId?: string | null
    tablePeriod: OwnerBookingsPeriod
    tableDate: Date
    calendarDate: Date
  },
) {
  return bookingService.getOwnerScheduleBookings(organizationIds, options)
}

export async function getBarberScheduleBookings(
  memberId: string,
  options: {
    tablePeriod: OwnerBookingsPeriod
    tableDate: Date
    calendarDate: Date
  },
) {
  return bookingService.getBarberScheduleBookings(memberId, options)
}
