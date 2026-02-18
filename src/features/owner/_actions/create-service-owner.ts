"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"

export interface CreateServiceOwnerInput {
  barbershopId: string
  name: string
  description: string
  imageUrl: string
  price: number
  durationMinutes: number
}

export async function createServiceOwner(input: CreateServiceOwnerInput) {
  const user = await getSession()
  if (!user?.id) throw new Error("Não autorizado")

  const barbershop = await db.barbershop.findFirst({
    where: {
      id: input.barbershopId,
      owners: { some: { id: user.id } },
    },
  })
  if (!barbershop)
    throw new Error("Barbearia não encontrada ou você não é o dono")

  const name = input.name.trim()
  const description = input.description.trim()
  const imageUrl = input.imageUrl.trim() || "https://utfs.io/f/placeholder"
  if (!name) throw new Error("Nome do serviço é obrigatório")
  if (input.price < 0) throw new Error("Preço não pode ser negativo")
  if (input.durationMinutes < 1) throw new Error("Duração mínima é 1 minuto")

  await db.barbershopService.create({
    data: {
      barbershopId: barbershop.id,
      name,
      description: description || name,
      imageUrl,
      price: input.price,
      durationMinutes: input.durationMinutes,
    },
  })

  revalidatePath("/owner")
  revalidatePath("/owner/services")
}
