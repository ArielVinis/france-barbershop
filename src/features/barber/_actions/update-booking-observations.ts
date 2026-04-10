"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/src/lib/prisma"
import { requireBarberForSession } from "@/src/features/barber/_data/require-barber-for-session"
import { PATHS } from "@/src/constants/PATHS"

const MAX_OBSERVATIONS_LENGTH = 500

export async function updateBookingObservations(
  bookingId: string,
  observations: string | null,
) {
  const { id: barberId } = await requireBarberForSession()

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

  revalidatePath(PATHS.PANEL.SCHEDULE)
  revalidatePath(PATHS.PANEL.BARBERS)
}
