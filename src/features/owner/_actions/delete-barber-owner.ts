"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { ForbiddenError, NotFoundError, requireBarbershopForOwner } from "@/src/lib/authz"
import { db } from "@/src/lib/prisma"
import { PATHS } from "@/src/constants/PATHS"

/**
 * Remove o vínculo barbeiro–barbearia. O usuário continua existindo (role pode ficar BARBER).
 */
export async function deleteBarberOwner(barberId: string) {
  const user = await getCurrentUser()

  const barber = await db.barber.findUnique({
    where: { id: barberId },
    select: { barbershopId: true },
  })
  if (!barber) throw new NotFoundError("Barbeiro não encontrado")

  try {
    await requireBarbershopForOwner(user.id, barber.barbershopId)
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new ForbiddenError("Você não tem acesso a este barbeiro")
    }
    throw error
  }

  await db.barber.delete({ where: { id: barberId } })

  revalidatePath(PATHS.PANEL.ROOT)
  revalidatePath(PATHS.PANEL.BARBERS)
}
