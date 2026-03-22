"use server"

import { getCurrentUser } from "@/src/lib/auth"
import { getBarberForOwner } from "@/src/app/(authenticated)/owner/_features/_data/get-barber-for-owner"

export async function getBarberScheduleForOwner(barberId: string) {
  const user = await getCurrentUser()
  return getBarberForOwner(barberId, user.id)
}
