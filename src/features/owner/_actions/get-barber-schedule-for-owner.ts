"use server"

import { getSession } from "@/src/lib/auth"
import { getBarberForOwner } from "@/src/features/owner/_data/get-barber-for-owner"

export async function getBarberScheduleForOwner(barberId: string) {
  const user = await getSession()
  if (!user?.id) return null
  return getBarberForOwner(barberId, user.id)
}
