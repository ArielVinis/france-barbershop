"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/src/lib/prisma"
import { requireBarberForSession } from "@/src/features/barber/_data/require-barber-for-session"
import { PATHS } from "@/src/constants/PATHS"

export async function deleteBarberBlockedSlot(slotId: string) {
  const { id: barberId } = await requireBarberForSession()

  const slot = await db.barberBlockedSlot.findFirst({
    where: { id: slotId, barberId },
  })
  if (!slot) {
    throw new Error("Bloqueio não encontrado")
  }

  await db.barberBlockedSlot.delete({
    where: { id: slotId },
  })

  revalidatePath(PATHS.PANEL.WORKED_HOURS)
  revalidatePath(PATHS.PANEL.BARBERS)
  revalidatePath(PATHS.PANEL.SCHEDULE)
}
