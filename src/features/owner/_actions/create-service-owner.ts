"use server"

import { revalidatePath } from "next/cache"
import {
  CreateServiceOwnerInputSchema,
  type CreateServiceOwnerInput,
  type CreateServiceOwnerOutput,
} from "@/src/features/owner/_dto/create-service-owner.dto"
import { getCurrentUser } from "@/src/server/auth/users"
import { ValidationError } from "@/src/lib/authz/errors"
import { requireBarbershopForOwner } from "@/src/lib/authz/require-barbershop-for-owner"
import { db } from "@/src/lib/prisma"
import { PATHS } from "@/src/constants/PATHS"

export type { CreateServiceOwnerInput, CreateServiceOwnerOutput }

export async function createServiceOwner(
  input: CreateServiceOwnerInput,
): Promise<CreateServiceOwnerOutput> {
  const parsed = CreateServiceOwnerInputSchema.safeParse(input)

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message)
  }

  const data = parsed.data
  const { user } = await getCurrentUser()

  const shop = await requireBarbershopForOwner(user.id, data.barbershopId)

  const created = await db.barbershopService.create({
    data: {
      barbershopId: shop.id,
      name: data.name.trim(),
      description: data.description?.trim() ?? "",
      imageUrl: data.imageUrl,
      price: data.price,
      durationMinutes: data.durationMinutes,
    },
    select: { id: true },
  })
  revalidatePath(PATHS.PANEL.ROOT)
  revalidatePath(PATHS.PANEL.SERVICES)
  return created
}
