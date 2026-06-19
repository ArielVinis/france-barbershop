"use server"

import { revalidatePath } from "next/cache"
import { serviceService } from "@/src/features/service/service.service"
import {
  CreateServiceOwnerInputSchema,
  type CreateServiceOwnerInput,
} from "@/src/features/service/service.schema"
import type { CreateServiceOwnerOutput } from "@/src/features/service/service.types"
import { getCurrentUser } from "@/src/server/auth/users"
import { ValidationError } from "@/src/shared/errors/errors"
import { PATHS } from "@/src/shared/constants/PATHS"

export async function createServiceOwner(
  input: CreateServiceOwnerInput,
): Promise<CreateServiceOwnerOutput> {
  const parsed = CreateServiceOwnerInputSchema.safeParse(input)

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message)
  }

  const { user } = await getCurrentUser()
  const created = await serviceService.createServiceOwner(user.id, parsed.data)

  revalidatePath(PATHS.PANEL.ROOT)
  revalidatePath(PATHS.PANEL.SERVICES)
  return created
}

export async function updateServiceOwner(
  input: import("@/src/features/service/service.schema").UpdateServiceOwnerInput,
) {
  const { user } = await getCurrentUser()
  await serviceService.updateServiceOwner(user.id, input)

  revalidatePath(PATHS.PANEL.ROOT)
  revalidatePath(PATHS.PANEL.SERVICES)
}

export async function deleteServiceOwner(serviceId: string) {
  const { user } = await getCurrentUser()
  await serviceService.deleteServiceOwner(user.id, serviceId)

  revalidatePath(PATHS.PANEL.ROOT)
  revalidatePath(PATHS.PANEL.SERVICES)
}

export async function getOwnerServices(
  ownerUserId: string,
  organizationId?: string,
) {
  return serviceService.getOwnerServices(ownerUserId, organizationId)
}
