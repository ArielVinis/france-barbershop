"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"

export interface UpdateServiceOwnerInput {
  serviceId: string
  name?: string
  description?: string
  imageUrl?: string
  price?: number
  durationMinutes?: number
}

export async function updateServiceOwner(input: UpdateServiceOwnerInput) {
  const user = await getSession()
  if (!user?.id) throw new Error("Não autorizado")

  const service = await db.barbershopService.findFirst({
    where: {
      id: input.serviceId,
      barbershop: {
        owners: { some: { id: user.id } },
      },
    },
  })
  if (!service)
    throw new Error("Serviço não encontrado ou não pertence à sua barbearia")

  const name = input.name !== undefined ? input.name.trim() : undefined
  const description =
    input.description !== undefined ? input.description.trim() : undefined
  if (name !== undefined && !name)
    throw new Error("Nome do serviço é obrigatório")
  if (input.price !== undefined && input.price < 0)
    throw new Error("Preço não pode ser negativo")
  if (input.durationMinutes !== undefined && input.durationMinutes < 1)
    throw new Error("Duração mínima é 1 minuto")

  await db.barbershopService.update({
    where: { id: input.serviceId },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl.trim() }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.durationMinutes !== undefined && {
        durationMinutes: input.durationMinutes,
      }),
    },
  })

  revalidatePath("/owner")
  revalidatePath("/owner/services")
}
