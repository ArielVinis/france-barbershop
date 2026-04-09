"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/src/lib/prisma"
import { requireBarberForSession } from "@/src/app/(authenticated)/barber/_features/_data/require-barber-for-session"

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

  revalidatePath("/barber/settings")
  revalidatePath("/barber")
  revalidatePath("/barber/bookings")
}
