"use server"

import { getCurrentUser } from "@/src/server/auth/users"
import { getBarberForOwner } from "@/src/features/owner/_data/get-barber-for-owner"

export async function getBarberScheduleForOwner(barberId: string) {
  const { user } = await getCurrentUser()
  return getBarberForOwner(barberId, user.id)
}
