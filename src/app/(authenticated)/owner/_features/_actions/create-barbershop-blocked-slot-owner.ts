"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"
import { getBarbershopForOwner } from "@/src/app/(authenticated)/owner/_features/_data/assert-owner-barbershop"

export async function createBarbershopBlockedSlotOwner(
  barbershopId: string,
  input: { startAt: Date; endAt: Date; reason: string | null },
) {
  const user = await getCurrentUser()
  const shop = await getBarbershopForOwner(user.id, barbershopId)
  if (!shop) throw new Error("Barbearia não encontrada ou você não é o dono")

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

  revalidatePath("/owner/horarios")
  revalidatePath(`/${shop.slug}`)

  return created
}
