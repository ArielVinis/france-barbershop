"use server"

import type { BookingStatus } from "@/prisma/generated/prisma/client"
import {
  CreatePanelBookingSchema,
  UpdatePanelBookingSchema,
  type CreatePanelBookingInput,
  type UpdatePanelBookingInput,
} from "@/src/features/booking/booking.schema"
import { bookingService } from "@/src/features/booking/booking.service"
import type {
  OwnerBookingsPeriod,
  UpdateBookingStatusOptions,
} from "@/src/features/booking/booking.types"
import { getCurrentUser } from "@/src/server/auth/users"
import { PATHS } from "@/src/shared/constants/PATHS"
import { requireBarberForSession } from "@/src/shared/guards/require-barber-for-session"
import { invalidateOrganizationCache } from "@/src/shared/lib/invalidate-organization-cache"
import type { OwnerOrganizationIdList } from "@/src/shared/types/panel-data-scope"
import { revalidatePath } from "next/cache"

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

export async function createBookingOwner(input: CreatePanelBookingInput) {
  const parsed = CreatePanelBookingSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos")
  }

  const { user } = await getCurrentUser()
  const created = await bookingService.createBookingOwner(user.id, parsed.data)

  revalidatePath(PATHS.PANEL.SCHEDULE)
  revalidatePath(PATHS.PANEL.ROOT)
  invalidateOrganizationCache({
    slug: created.slug,
    organizationId: created.organizationId,
  })
}

export async function updateBookingOwner(input: UpdatePanelBookingInput) {
  const parsed = UpdatePanelBookingSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos")
  }

  const { user } = await getCurrentUser()
  await bookingService.updateBookingOwner(user.id, parsed.data)

  revalidatePath(PATHS.PANEL.SCHEDULE)
  revalidatePath(PATHS.PANEL.ROOT)
}

export async function listOrganizationClients(
  organizationIds: OwnerOrganizationIdList,
) {
  return bookingService.listOrganizationClients(organizationIds)
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

  revalidatePath(PATHS.PANEL.SCHEDULE)
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

  revalidatePath(PATHS.PANEL.SCHEDULE)
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
