"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"
import { requireBarbershopForOwner } from "@/src/lib/authz"
import { PATHS } from "@/src/constants/PATHS"

export async function createBarbershopBlockedSlotOwner(
  barbershopId: string,
  input: { startAt: Date; endAt: Date; reason: string | null },
) {
  const user = await getCurrentUser()
  const shop = await requireBarbershopForOwner(user.id, barbershopId)

  if (input.startAt >= input.endAt) {
    throw new Error("Data de fim deve ser após o início")
  }

  const created = await db.barbershopBlockedSlot.create({
    data: {
      barbershopId,
      startAt: input.startAt,
      endAt: input.endAt,
      reason: input.reason,
    },
  })

  revalidatePath(PATHS.PANEL.WORKED_HOURS)
  revalidatePath(PATHS.BARBERSHOP.ROOT(shop.slug))

  return created
}
