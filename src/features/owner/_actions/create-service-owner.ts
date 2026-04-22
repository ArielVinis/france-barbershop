"use server"

import { revalidatePath } from "next/cache"
import { assertCan } from "@/src/auth"
import {
  CreateServiceOwnerInputSchema,
  type CreateServiceOwnerInput,
  type CreateServiceOwnerOutput,
} from "@/src/features/owner/_dto/create-service-owner.dto"
import { getAuthContext } from "@/src/lib/auth"
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
  const ctx = await getAuthContext()

  assertCan(ctx, "create", "service", {
    barbershopId: data.barbershopId,
  })

  const shop = await requireBarbershopForOwner(ctx.userId, data.barbershopId)

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
