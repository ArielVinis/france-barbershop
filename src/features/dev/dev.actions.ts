"use server"

import { revalidatePath } from "next/cache"
import { devService } from "@/src/features/dev/dev.service"
import { getCurrentUser } from "@/src/server/auth/users"

export async function setCurrentUserAsOwner(organizationId: string) {
  const { user } = await getCurrentUser()
  await devService.setCurrentUserAsOwner(user.id, organizationId)

  revalidatePath("/")
  revalidatePath("/owner")
  revalidatePath("/dev/owner")
}
