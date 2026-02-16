"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"

const MAX_OBSERVATIONS_LENGTH = 500

export async function updateBookingObservations(
  bookingId: string,
  observations: string | null,
) {
  const { id: barberId } = await getSession()

  const booking = await db.booking.findFirst({
    where: { id: bookingId, barberId },
  })
  if (!booking) {
    throw new Error("Agendamento não encontrado")
  }

  const trimmed = observations?.trim().slice(0, MAX_OBSERVATIONS_LENGTH) ?? null

  await db.booking.update({
    where: { id: bookingId },
    data: { observations: trimmed || null },
  })

  revalidatePath("/barber/bookings")
  revalidatePath("/barber")
}
