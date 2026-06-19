"use server"

import { revalidatePath } from "next/cache"
import { memberService } from "@/src/features/member/member.service"
import { getCurrentUser } from "@/src/server/auth/users"
import { PATHS } from "@/src/shared/constants/PATHS"

export async function createBarberOwner(
  organizationId: string,
  userEmail: string,
) {
  const { user } = await getCurrentUser()
  await memberService.createBarberOwner(user.id, organizationId, userEmail)

  revalidatePath(PATHS.PANEL.ROOT)
  revalidatePath(PATHS.PANEL.BARBERS)
}

export async function deleteBarberOwner(barberId: string) {
  const { user } = await getCurrentUser()
  await memberService.deleteBarberOwner(user.id, barberId)

  revalidatePath(PATHS.PANEL.ROOT)
  revalidatePath(PATHS.PANEL.BARBERS)
}

export async function toggleBarberActiveOwner(barberId: string) {
  const { user } = await getCurrentUser()
  await memberService.toggleBarberActiveOwner(user.id, barberId)

  revalidatePath(PATHS.PANEL.ROOT)
  revalidatePath(PATHS.PANEL.BARBERS)
}

export async function getBarberScheduleForOwner(barberId: string) {
  const { user } = await getCurrentUser()
  return memberService.getBarberScheduleForOwner(barberId, user.id)
}

export async function getOwnerBarbers(
  ownerUserId: string,
  organizationId?: string,
) {
  return memberService.getOwnerBarbers(ownerUserId, organizationId)
}

export async function getBarberByUserId(userId: string) {
  return memberService.getBarberByUserId(userId)
}

export async function getBarberForOwner(barberId: string, ownerId: string) {
  return memberService.getBarberForOwner(barberId, ownerId)
}
