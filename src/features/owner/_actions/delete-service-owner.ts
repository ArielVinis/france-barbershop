"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"

export async function deleteServiceOwner(serviceId: string) {
  const user = await getSession()
  if (!user?.id) throw new Error("Não autorizado")

  const service = await db.barbershopService.findFirst({
    where: {
      id: serviceId,
      barbershop: {
        owners: { some: { id: user.id } },
      },
    },
    include: { _count: { select: { bookings: true } } },
  })
  if (!service)
    throw new Error("Serviço não encontrado ou não pertence à sua barbearia")
  if (service._count.bookings > 0)
    throw new Error(
      "Não é possível excluir: existem agendamentos vinculados a este serviço",
    )

  await db.barbershopService.delete({ where: { id: serviceId } })

  revalidatePath("/owner")
  revalidatePath("/owner/services")
}
