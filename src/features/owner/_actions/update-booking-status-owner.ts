"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { ForbiddenError, NotFoundError, requireBarbershopForOwner } from "@/src/lib/authz"
import { db } from "@/src/lib/prisma"
import type {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/prisma/generated/prisma/client"
import { PATHS } from "@/src/constants/PATHS"

export interface UpdateBookingStatusOwnerOptions {
  paymentMethod?: PaymentMethod
  paymentStatus?: PaymentStatus
}

/**
 * Permite ao dono alterar status de um agendamento (desde que seja de uma barbearia dele).
 */
export async function updateBookingStatusOwner(
  bookingId: string,
  status: BookingStatus,
  options?: UpdateBookingStatusOwnerOptions,
) {
  const user = await getCurrentUser()

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { service: { select: { barbershopId: true } } },
  })
  if (!booking) throw new NotFoundError("Agendamento não encontrado")

  try {
    await requireBarbershopForOwner(user.id, booking.service.barbershopId)
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new ForbiddenError("Você não tem acesso a este agendamento")
    }
    throw error
  }

  const allowed: Record<BookingStatus, BookingStatus[]> = {
    CONFIRMED: ["IN_PROGRESS", "CANCELLED", "NO_SHOW"],
    IN_PROGRESS: ["FINISHED", "CANCELLED", "NO_SHOW"],
    FINISHED: [],
    CANCELLED: [],
    NO_SHOW: [],
  }
  const next = allowed[booking.status]
  if (!next?.includes(status)) {
    throw new Error(
      `Não é possível alterar de ${booking.status} para ${status}`,
    )
  }

  const data: {
    status: BookingStatus
    paymentMethod?: PaymentMethod
    paymentStatus?: PaymentStatus
  } = { status }
  if (status === "FINISHED" && options) {
    if (options.paymentMethod != null)
      data.paymentMethod = options.paymentMethod
    if (options.paymentStatus != null)
      data.paymentStatus = options.paymentStatus ?? "PAID"
  }

  await db.booking.update({
    where: { id: bookingId },
    data,
  })

  revalidatePath(PATHS.PANEL.ROOT)
}
