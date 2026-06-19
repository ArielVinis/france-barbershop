import { cache } from "react"
import { serviceRepository } from "@/src/features/service/service.repository"
import type {
  CreateServiceOwnerInput,
  UpdateServiceOwnerInput,
} from "@/src/features/service/service.schema"
import type { CreateServiceOwnerOutput } from "@/src/features/service/service.types"
import { ForbiddenError, NotFoundError } from "@/src/shared/errors/errors"
import {
  getOrganizationsForOwner,
  requireOrganizationForOwner,
} from "@/src/shared/guards"

export const serviceService = {
  async createServiceOwner(
    ownerUserId: string,
    input: CreateServiceOwnerInput,
  ): Promise<CreateServiceOwnerOutput> {
    const shop = await requireOrganizationForOwner(
      ownerUserId,
      input.organizationId,
    )

    return serviceRepository.create({
      organizationId: shop.id,
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
      imageUrl: input.imageUrl,
      price: input.price,
      durationMinutes: input.durationMinutes,
    })
  },

  async updateServiceOwner(ownerUserId: string, input: UpdateServiceOwnerInput) {
    const service = await serviceRepository.findById(input.serviceId)
    if (!service) throw new NotFoundError("Serviço não encontrado")

    try {
      await requireOrganizationForOwner(ownerUserId, service.organizationId)
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

    await serviceRepository.update(input.serviceId, {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl.trim() }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.durationMinutes !== undefined && {
        durationMinutes: input.durationMinutes,
      }),
    })
  },

  async deleteServiceOwner(ownerUserId: string, serviceId: string) {
    const service = await serviceRepository.findByIdWithBookingCount(serviceId)
    if (!service) throw new NotFoundError("Serviço não encontrado")

    try {
      await requireOrganizationForOwner(ownerUserId, service.organizationId)
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

    await serviceRepository.delete(serviceId)
  },

  getOwnerServices: cache(
    async (ownerUserId: string, organizationId?: string) => {
      const scopedOrganizationIds = organizationId
        ? [(await requireOrganizationForOwner(ownerUserId, organizationId)).id]
        : (await getOrganizationsForOwner(ownerUserId)).map((org) => org.id)

      if (scopedOrganizationIds.length === 0) return []

      return serviceRepository.findManyForOrganizations(scopedOrganizationIds)
    },
  ),
}
