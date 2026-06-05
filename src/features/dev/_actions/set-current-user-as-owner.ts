"use server"

import { revalidatePath } from "next/cache"
import { Role } from "@/prisma/generated/prisma/enums"
import { getCurrentUser } from "@/src/server/auth/users"
import { db } from "@/src/lib/prisma"

/**
 * Apenas em desenvolvimento: define o usuário logado como OWNER e vincula à organização.
 */
export async function setCurrentUserAsOwner(organizationId: string) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Disponível apenas em desenvolvimento")
  }

  const { user } = await getCurrentUser()

  const organization = await db.organization.findUnique({
    where: { id: organizationId },
    select: { id: true },
  })
  if (!organization) {
    throw new Error("Barbearia não encontrada")
  }

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { role: Role.OWNER },
    })

    const existing = await tx.member.findFirst({
      where: {
        organizationId: organization.id,
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
          organizationId: organization.id,
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
