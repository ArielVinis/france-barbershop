"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/server/auth/users"
import {
  ForbiddenError,
  NotFoundError,
  requireOrganizationForOwner,
} from "@/src/lib/authz"
import { db } from "@/src/lib/prisma"
import { PATHS } from "@/src/constants/PATHS"

/**
 * Remove o vínculo barbeiro–organização. O usuário continua existindo.
 */
export async function deleteBarberOwner(barberId: string) {
  const { user } = await getCurrentUser()

  const barber = await db.member.findUnique({
    where: { id: barberId },
    select: { organizationId: true },
  })
  if (!barber) throw new NotFoundError("Barbeiro não encontrado")

  try {
    await requireOrganizationForOwner(user.id, barber.organizationId)
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new ForbiddenError("Você não tem acesso a este barbeiro")
    }
    throw error
  }

  await db.member.delete({ where: { id: barberId } })

  revalidatePath(PATHS.PANEL.ROOT)
  revalidatePath(PATHS.PANEL.BARBERS)
}
