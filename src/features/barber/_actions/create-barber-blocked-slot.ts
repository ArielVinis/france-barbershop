"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/src/lib/prisma"
import { requireBarberForSession } from "@/src/features/barber/_data/require-barber-for-session"
import { PATHS } from "@/src/constants/PATHS"

export type CreateBarberBlockedSlotInput = {
  startAt: Date
  endAt: Date
  reason?: string | null
}

export async function createBarberBlockedSlot(
  input: CreateBarberBlockedSlotInput,
) {
  const { id: barberId } = await requireBarberForSession()

  const start = new Date(input.startAt)
  const end = new Date(input.endAt)
  if (start >= end) {
    throw new Error("Data/hora de fim deve ser após o início")
  }

  const created = await db.barberBlockedSlot.create({
    data: {
      barberId,
      startAt: start,
      endAt: end,
      reason: input.reason?.trim() || null,
    },
  })

  revalidatePath(PATHS.PANEL.SCHEDULE)
  revalidatePath(PATHS.PANEL.ROOT)

  return created
}
