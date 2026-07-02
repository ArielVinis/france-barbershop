"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod"
import { bookingService } from "@/src/features/booking/booking.service"
import {
  CreateBookingSchema,
  DeleteBookingSchema,
} from "@/src/features/booking/booking.schema"
import { auth } from "@/src/shared/lib/auth"
import { PATHS } from "@/src/shared/constants/PATHS"
import { invalidateOrganizationCache } from "@/src/shared/lib/invalidate-organization-cache"

export const createBooking = async (
  input: z.infer<typeof CreateBookingSchema>,
) => {
  const parsed = CreateBookingSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos")
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) {
    throw new Error("Usuário não autenticado")
  }

  const created = await bookingService.createBooking(parsed.data, session.user.id)

  revalidatePath(PATHS.BARBERSHOP.ROOT(created.slug))
  revalidatePath("/bookings")
  invalidateOrganizationCache({
    slug: created.slug,
    organizationId: created.organizationId,
  })
}

export const deleteBooking = async (bookingId: string) => {
  const parsed = DeleteBookingSchema.safeParse({ bookingId })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos")
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) {
    throw new Error("Usuário não autenticado")
  }

  await bookingService.deleteBooking(parsed.data.bookingId, session.user.id)

  revalidatePath(PATHS.BOOKINGS.ROOT)
}

interface GetBookingsProps {
  serviceId: string
  date: Date
  memberId?: string
}

export const getBookings = async ({
  date,
  serviceId,
  memberId,
}: GetBookingsProps) => {
  return bookingService.getBookings({ serviceId, date, memberId })
}

export const getConfirmedBookings = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) return []

  return bookingService.getConfirmedBookings(session.user.id)
}

export const getConcludedBookings = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) return []

  return bookingService.getConcludedBookings(session.user.id)
}
