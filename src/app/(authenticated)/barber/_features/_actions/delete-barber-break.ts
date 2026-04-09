"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/src/lib/prisma"
import { requireBarberForSession } from "@/src/app/(authenticated)/barber/_features/_data/require-barber-for-session"

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

  revalidatePath("/barber/settings")
  revalidatePath("/barber")
  revalidatePath("/barber/bookings")
}
