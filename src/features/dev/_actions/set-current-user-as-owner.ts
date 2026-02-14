"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"

/**
 * Apenas em desenvolvimento: define o usuário logado como OWNER e vincula à barbearia.
 * Em produção esta action não faz nada.
 */
export async function setCurrentUserAsOwner(barbershopId: string) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Disponível apenas em desenvolvimento")
  }

  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string } | undefined
  if (!user?.id) {
    throw new Error("Faça login para continuar")
  }

  const barbershop = await db.barbershop.findUnique({
    where: { id: barbershopId },
    select: { id: true },
  })
  if (!barbershop) {
    throw new Error("Barbearia não encontrada")
  }

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { role: "OWNER" },
    }),
    db.barbershop.update({
      where: { id: barbershopId },
      data: { owners: { connect: { id: user.id } } },
    }),
  ])

  revalidatePath("/")
  revalidatePath("/owner")
  revalidatePath("/dev/owner")
}
