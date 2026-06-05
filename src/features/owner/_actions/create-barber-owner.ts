"use server"

import { Role } from "@/prisma/generated/prisma/enums"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/server/auth/users"
import { requireOrganizationForOwner } from "@/src/lib/authz"
import { db } from "@/src/lib/prisma"
import { PATHS } from "@/src/constants/PATHS"

export async function createBarberOwner(
  organizationId: string,
  userEmail: string,
) {
  const { user } = await getCurrentUser()

  const ownerOrganization = await requireOrganizationForOwner(
    user.id,
    organizationId,
  )

  const existingUser = await db.user.findUnique({
    where: { email: userEmail.trim().toLowerCase() },
    include: {
      members: { where: { role: Role.MEMBER }, take: 1 },
    },
  })
  if (!existingUser)
    throw new Error("Nenhum usuário encontrado no sistema com este e-mail")
  if (existingUser.members.length > 0)
    throw new Error("Este usuário já é barbeiro em outra barbearia")

  const existingInOrg = await db.member.findFirst({
    where: {
      organizationId: ownerOrganization.id,
      userId: existingUser.id,
    },
  })
  if (existingInOrg) {
    throw new Error("Este usuário já pertence a esta barbearia")
  }

  await db.$transaction([
    db.user.update({
      where: { id: existingUser.id },
      data: { role: Role.MEMBER },
    }),
    db.member.create({
      data: {
        userId: existingUser.id,
        organizationId: ownerOrganization.id,
        role: Role.MEMBER,
        isActive: true,
      },
    }),
  ])

  revalidatePath(PATHS.PANEL.ROOT)
  revalidatePath(PATHS.PANEL.BARBERS)
}
