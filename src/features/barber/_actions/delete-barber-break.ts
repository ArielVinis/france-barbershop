"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"

export async function deleteBarberBreak(breakId: string) {
  const { id: barberId } = (await getCurrentUser()) ?? {}

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
