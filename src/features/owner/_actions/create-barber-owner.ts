"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { getBarbershopForOwner } from "@/src/lib/authz"
import { db } from "@/src/lib/prisma"
import { PATHS } from "@/src/constants/PATHS"

export async function createBarberOwner(
  barbershopId: string,
  userEmail: string,
) {
  const user = await getCurrentUser()

  const ownerBarbershop = await getBarbershopForOwner(user.id, barbershopId)
  if (!ownerBarbershop)
    throw new Error("Barbearia não encontrada ou você não é o dono")

  const existingUser = await db.user.findUnique({
    where: { email: userEmail.trim().toLowerCase() },
    include: { barber: true },
  })
  if (!existingUser)
    throw new Error("Nenhum usuário encontrado no sistema com este e-mail")
  if (existingUser.barber)
    throw new Error("Este usuário já é barbeiro em outra barbearia")

  await db.$transaction([
    db.user.update({
      where: { id: existingUser.id },
      data: { role: "BARBER" },
    }),
    db.barber.create({
      data: {
        userId: existingUser.id,
        barbershopId: ownerBarbershop.id,
        isActive: true,
      },
    }),
  ])

  revalidatePath(PATHS.PANEL.ROOT)
  revalidatePath(PATHS.PANEL.BARBERS)
}
