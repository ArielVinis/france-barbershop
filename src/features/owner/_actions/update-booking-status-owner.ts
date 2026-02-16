"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"
import { BookingStatus, PaymentMethod, PaymentStatus } from "@prisma/client"

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
  const user = await getSession()

  const booking = await db.booking.findFirst({
    where: {
      id: bookingId,
      service: {
        barbershop: {
          owners: { some: { id: user.id } },
        },
      },
    },
    include: { service: true },
  })
  if (!booking) {
    throw new Error("Agendamento não encontrado")
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

  revalidatePath("/owner")
}
