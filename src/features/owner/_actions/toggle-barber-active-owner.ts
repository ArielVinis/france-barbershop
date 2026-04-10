"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"
import { PATHS } from "@/src/constants/PATHS"

export async function toggleBarberActiveOwner(barberId: string) {
  const user = await getCurrentUser()

  const barber = await db.barber.findFirst({
    where: {
      id: barberId,
      barbershop: {
        owners: { some: { id: user.id } },
      },
    },
  })
  if (!barber)
    throw new Error("Barbeiro não encontrado ou não pertence à sua barbearia")

  await db.barber.update({
    where: { id: barberId },
    data: { isActive: !barber.isActive },
  })

  revalidatePath(PATHS.PANEL.ROOT)
  revalidatePath(PATHS.PANEL.BARBERS)
}
