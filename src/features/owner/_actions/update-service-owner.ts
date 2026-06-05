"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/server/auth/users"
import { ForbiddenError, NotFoundError, requireOrganizationForOwner } from "@/src/lib/authz"
import { db } from "@/src/lib/prisma"
import { PATHS } from "@/src/constants/PATHS"

export interface UpdateServiceOwnerInput {
  serviceId: string
  name?: string
  description?: string
  imageUrl?: string
  price?: number
  durationMinutes?: number
}

export async function updateServiceOwner(input: UpdateServiceOwnerInput) {
  const { user } = await getCurrentUser()

  const service = await db.organizationService.findUnique({
    where: { id: input.serviceId },
  })
  if (!service) throw new NotFoundError("Serviço não encontrado")

  try {
    await requireOrganizationForOwner(user.id, service.organizationId)
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new ForbiddenError("Você não tem acesso a este serviço")
    }
    throw error
  }

  const name = input.name !== undefined ? input.name.trim() : undefined
  const description =
    input.description !== undefined ? input.description.trim() : undefined
  if (name !== undefined && !name)
    throw new Error("Nome do serviço é obrigatório")
  if (input.price !== undefined && input.price < 0)
    throw new Error("Preço não pode ser negativo")
  if (input.durationMinutes !== undefined && input.durationMinutes < 1)
    throw new Error("Duração mínima é 1 minuto")

  await db.organizationService.update({
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

  revalidatePath(PATHS.PANEL.ROOT)
  revalidatePath(PATHS.PANEL.SERVICES)
}
