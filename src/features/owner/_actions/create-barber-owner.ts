"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"

export async function createBarberOwner(
  barbershopId: string,
  userEmail: string,
) {
  const user = await getSession()
  if (!user?.id) throw new Error("Não autorizado")

  const ownerBarbershop = await db.barbershop.findFirst({
    where: {
      id: barbershopId,
      owners: { some: { id: user.id } },
    },
  })
  if (!ownerBarbershop)
    throw new Error("Barbearia não encontrada ou você não é o dono")

  const existingUser = await db.user.findUnique({
    where: { email: userEmail.trim().toLowerCase() },
    include: { barber: true },
  })
  if (!existingUser)
    throw new Error("Nenhum usuário encontrado com este e-mail")
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

  revalidatePath("/owner")
  revalidatePath("/owner/barbers")
}
