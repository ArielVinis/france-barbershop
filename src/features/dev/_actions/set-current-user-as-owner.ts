"use server"

import { revalidatePath } from "next/cache"
import { Role } from "@/prisma/generated/prisma/enums"
import { getCurrentUser } from "@/src/server/auth/users"
import { db } from "@/src/lib/prisma"

/**
 * Apenas em desenvolvimento: define o usuário logado como OWNER e vincula à barbearia
 * via Member OWNER na organização da loja.
 */
export async function setCurrentUserAsOwner(barbershopId: string) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Disponível apenas em desenvolvimento")
  }

  const { user } = await getCurrentUser()

  const barbershop = await db.barbershop.findUnique({
    where: { id: barbershopId },
    select: { id: true, organizationId: true },
  })
  if (!barbershop) {
    throw new Error("Barbearia não encontrada")
  }

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { role: Role.OWNER },
    })

    const existing = await tx.member.findFirst({
      where: {
        organizationId: barbershop.organizationId,
        userId: user.id,
      },
    })

    if (existing) {
      await tx.member.update({
        where: { id: existing.id },
        data: { role: Role.OWNER },
      })
    } else {
      await tx.member.create({
        data: {
          organizationId: barbershop.organizationId,
          userId: user.id,
          role: Role.OWNER,
        },
      })
    }
  })

  revalidatePath("/")
  revalidatePath("/owner")
  revalidatePath("/dev/owner")
}
