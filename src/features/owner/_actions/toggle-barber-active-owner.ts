"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/server/auth/users"
import {
  ForbiddenError,
  NotFoundError,
  requireBarbershopForOwner,
} from "@/src/lib/authz"
import { db } from "@/src/lib/prisma"
import { PATHS } from "@/src/constants/PATHS"

export async function toggleBarberActiveOwner(barberId: string) {
  const { user } = await getCurrentUser()

  const barber = await db.member.findUnique({
    where: { id: barberId },
    select: {
      isActive: true,
      organization: {
        select: { barbershop: { select: { id: true } } },
      },
    },
  })
  if (!barber) throw new NotFoundError("Barbeiro não encontrado")

  const barbershopId = barber.organization.barbershop?.id
  if (!barbershopId) {
    throw new NotFoundError("Barbearia não encontrada para esta organização")
  }

  try {
    await requireBarbershopForOwner(user.id, barbershopId)
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new ForbiddenError("Você não tem acesso a este barbeiro")
    }
    throw error
  }

  await db.member.update({
    where: { id: barberId },
    data: { isActive: !barber.isActive },
  })

  revalidatePath(PATHS.PANEL.ROOT)
  revalidatePath(PATHS.PANEL.BARBERS)
}
