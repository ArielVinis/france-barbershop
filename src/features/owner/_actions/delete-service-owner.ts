"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { ForbiddenError, NotFoundError, requireBarbershopForOwner } from "@/src/lib/authz"
import { db } from "@/src/lib/prisma"
import { PATHS } from "@/src/constants/PATHS"

export async function deleteServiceOwner(serviceId: string) {
  const user = await getCurrentUser()

  const service = await db.barbershopService.findUnique({
    where: { id: serviceId },
    include: { _count: { select: { bookings: true } } },
  })
  if (!service) throw new NotFoundError("Serviço não encontrado")

  try {
    await requireBarbershopForOwner(user.id, service.barbershopId)
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new ForbiddenError("Você não tem acesso a este serviço")
    }
    throw error
  }

  if (service._count.bookings > 0)
    throw new Error(
      "Não é possível excluir: existem agendamentos vinculados a este serviço",
    )

  await db.barbershopService.delete({ where: { id: serviceId } })

  revalidatePath(PATHS.PANEL.ROOT)
  revalidatePath(PATHS.PANEL.SERVICES)
}
