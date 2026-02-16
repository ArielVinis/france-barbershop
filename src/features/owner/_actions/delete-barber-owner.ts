"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"

/**
 * Remove o vínculo barbeiro–barbearia. O usuário continua existindo (role pode ficar BARBER).
 */
export async function deleteBarberOwner(barberId: string) {
  const user = await getSession()
  if (!user?.id) throw new Error("Não autorizado")

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

  await db.barber.delete({ where: { id: barberId } })

  revalidatePath("/owner")
  revalidatePath("/owner/barbers")
}
