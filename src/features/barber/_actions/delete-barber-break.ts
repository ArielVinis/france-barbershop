"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/src/lib/prisma"
import { requireBarberForSession } from "@/src/features/barber/_data/require-barber-for-session"
import { PATHS } from "@/src/constants/PATHS"

export async function deleteBarberBreak(breakId: string) {
  const { id: barberId } = await requireBarberForSession()

  const barberBreak = await db.barberBreak.findFirst({
    where: { id: breakId, barberId },
  })
  if (!barberBreak) {
    throw new Error("Pausa não encontrada")
  }

  await db.barberBreak.delete({
    where: { id: breakId },
  })

  revalidatePath(PATHS.PANEL.WORKED_HOURS)
  revalidatePath(PATHS.PANEL.BARBERS)
  revalidatePath(PATHS.PANEL.SCHEDULE)
}
