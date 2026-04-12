"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { resolvePanelContext } from "@/src/lib/authz"
import { db } from "@/src/lib/prisma"
import { PATHS } from "@/src/constants/PATHS"

export interface CreateServiceOwnerInput {
  barbershopId: string
  name: string
  description: string
  imageUrl: string
  price: number
  durationMinutes: number
}

export async function createServiceOwner(input: CreateServiceOwnerInput) {
  const user = await getCurrentUser()
  const ctx = await resolvePanelContext(user, { shopId: input.barbershopId })
  if (!ctx || ctx.role !== "OWNER") {
    throw new Error("Barbearia não encontrada ou você não é o dono")
  }

  const name = input.name.trim()
  const description = input.description.trim()
  const imageUrl = input.imageUrl.trim() || "https://utfs.io/f/placeholder"
  if (!name) throw new Error("Nome do serviço é obrigatório")
  if (input.price < 0) throw new Error("Preço não pode ser negativo")
  if (input.durationMinutes < 1) throw new Error("Duração mínima é 1 minuto")

  await db.barbershopService.create({
    data: {
      barbershopId: ctx.barbershopId,
      name,
      description: description || name,
      imageUrl,
      price: input.price,
      durationMinutes: input.durationMinutes,
    },
  })

  revalidatePath(PATHS.PANEL.ROOT)
  revalidatePath(PATHS.PANEL.SERVICES)
}
