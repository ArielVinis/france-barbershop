"use server"

import { revalidatePath } from "next/cache"
import { getBarberSession } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"

export type CreateBarberBlockedSlotInput = {
  startAt: Date
  endAt: Date
  reason?: string | null
}

export async function createBarberBlockedSlot(
  input: CreateBarberBlockedSlotInput,
) {
  const { barberId } = await getBarberSession()

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

  revalidatePath("/barber/settings")
  revalidatePath("/barber")
  revalidatePath("/barber/bookings")

  return created
}
