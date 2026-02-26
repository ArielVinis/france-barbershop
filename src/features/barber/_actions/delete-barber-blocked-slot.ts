"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"

export async function deleteBarberBlockedSlot(slotId: string) {
  const { id: barberId } = (await getCurrentUser()) ?? {}

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
