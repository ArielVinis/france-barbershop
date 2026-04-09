"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/src/lib/prisma"
import { requireBarberForSession } from "@/src/app/(authenticated)/barber/_features/_data/require-barber-for-session"
import type {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/prisma/generated/prisma/client"

export interface UpdateBookingStatusOptions {
  /** Obrigatório ao finalizar (FINISHED) para relatórios */
  paymentMethod?: PaymentMethod
  paymentStatus?: PaymentStatus
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  options?: UpdateBookingStatusOptions,
) {
  const barber = await requireBarberForSession()

  const booking = await db.booking.findFirst({
    where: { id: bookingId, barberId: barber.id },
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

  revalidatePath("/barber/bookings")
  revalidatePath("/barber")
}
