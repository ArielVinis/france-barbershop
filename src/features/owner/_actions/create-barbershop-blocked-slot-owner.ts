"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/server/auth/users"
import { db } from "@/src/lib/prisma"
import { requireOrganizationForOwner } from "@/src/lib/authz"
import { PATHS } from "@/src/constants/PATHS"

export async function createBarbershopBlockedSlotOwner(
  organizationId: string,
  input: { startAt: Date; endAt: Date; reason: string | null },
) {
  const { user } = await getCurrentUser()
  const shop = await requireOrganizationForOwner(user.id, organizationId)

  if (input.startAt >= input.endAt) {
    throw new Error("Data de fim deve ser após o início")
  }

  const created = await db.organizationBlockedSlot.create({
    data: {
      organizationId,
      startAt: input.startAt,
      endAt: input.endAt,
      reason: input.reason,
    },
  })

  revalidatePath(PATHS.PANEL.WORKED_HOURS)
  revalidatePath(PATHS.BARBERSHOP.ROOT(shop.slug))

  return created
}
