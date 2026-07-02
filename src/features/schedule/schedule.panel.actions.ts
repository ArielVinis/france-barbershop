"use server"

import { revalidatePath } from "next/cache"
import { scheduleService } from "@/src/features/schedule/schedule.service"
import type {
  BarbershopScheduleInput,
  CreateBarbershopBreakInput,
} from "@/src/features/schedule/schedule.schema"
import { getCurrentUser } from "@/src/server/auth/users"
import { PATHS } from "@/src/shared/constants/PATHS"
import { invalidateOrganizationCache } from "@/src/shared/lib/invalidate-organization-cache"

export async function upsertBarbershopSchedulesOwner(
  organizationId: string,
  inputs: BarbershopScheduleInput[],
) {
  const { user } = await getCurrentUser()
  const shop = await scheduleService.upsertBarbershopSchedulesOwner(
    user.id,
    organizationId,
    inputs,
  )

  revalidatePath(PATHS.PANEL.WORKED_HOURS)
  revalidatePath(PATHS.BARBERSHOP.ROOT(shop.slug))
  invalidateOrganizationCache({ slug: shop.slug, organizationId: shop.id })
}

export async function createBarbershopBreakOwner(
  organizationId: string,
  input: CreateBarbershopBreakInput,
) {
  const { user } = await getCurrentUser()
  const { shop, created } = await scheduleService.createBarbershopBreakOwner(
    user.id,
    organizationId,
    input,
  )

  revalidatePath(PATHS.PANEL.WORKED_HOURS)
  revalidatePath(PATHS.BARBERSHOP.ROOT(shop.slug))
  invalidateOrganizationCache({ slug: shop.slug, organizationId: shop.id })

  return created
}

export async function deleteBarbershopBreakOwner(breakId: string) {
  const { user } = await getCurrentUser()
  const shop = await scheduleService.deleteBarbershopBreakOwner(user.id, breakId)

  revalidatePath(PATHS.PANEL.WORKED_HOURS)
  revalidatePath(PATHS.BARBERSHOP.ROOT(shop.slug))
  invalidateOrganizationCache({ slug: shop.slug, organizationId: shop.id })
}

export async function createBarbershopBlockedSlotOwner(
  organizationId: string,
  input: { startAt: Date; endAt: Date; reason: string | null },
) {
  const { user } = await getCurrentUser()
  const { shop, created } =
    await scheduleService.createBarbershopBlockedSlotOwner(
      user.id,
      organizationId,
      input,
    )

  revalidatePath(PATHS.PANEL.WORKED_HOURS)
  revalidatePath(PATHS.BARBERSHOP.ROOT(shop.slug))
  invalidateOrganizationCache({ slug: shop.slug, organizationId: shop.id })

  return created
}

export async function deleteBarbershopBlockedSlotOwner(slotId: string) {
  const { user } = await getCurrentUser()
  const shop = await scheduleService.deleteBarbershopBlockedSlotOwner(
    user.id,
    slotId,
  )

  revalidatePath(PATHS.PANEL.WORKED_HOURS)
  revalidatePath(PATHS.BARBERSHOP.ROOT(shop.slug))
  invalidateOrganizationCache({ slug: shop.slug, organizationId: shop.id })
}

export async function getOwnerOrganizationHours(
  userId: string,
  organizationId: string,
) {
  return scheduleService.getOwnerOrganizationHours(userId, organizationId)
}
