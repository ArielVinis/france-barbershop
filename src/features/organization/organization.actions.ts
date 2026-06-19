"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { organizationService } from "@/src/features/organization/organization.service"
import {
  CreateOrganizationWithProfileSchema,
  type CreateOrganizationWithProfileInput,
  type CreateOrganizationWithProfileResult,
} from "@/src/features/organization/organization.schema"
import { getCurrentUser } from "@/src/server/auth/users"
import { auth } from "@/src/shared/lib/auth"
import { PATHS } from "@/src/shared/constants/PATHS"

export async function createOrganizationWithProfile(
  input: CreateOrganizationWithProfileInput,
): Promise<CreateOrganizationWithProfileResult> {
  const parsed = CreateOrganizationWithProfileSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    }
  }

  const { user } = await getCurrentUser()
  const result = await organizationService.createOrganizationWithProfile(
    parsed.data,
    user,
  )

  if (!result.success) {
    return { success: false, error: result.error }
  }

  const requestHeaders = await headers()
  await auth.api.setActiveOrganization({
    body: { organizationId: result.organizationId },
    headers: requestHeaders,
  })

  revalidatePath(PATHS.ROOT)
  revalidatePath(PATHS.PANEL.ROOT)

  return { success: true, organizationId: result.organizationId }
}

export async function getOrganizations() {
  const { user } = await getCurrentUser()
  return organizationService.getOrganizations(user.id)
}

export async function getActiveOrganization(userId: string) {
  return organizationService.getActiveOrganization(userId)
}

export async function getOrganizationBySlug(slug?: string) {
  return organizationService.getOrganizationBySlug(slug)
}

export async function getOrganizationById(id?: string) {
  return organizationService.getOrganizationById(id)
}

export async function getOwnerByUserId(userId: string) {
  return organizationService.getOwnerByUserId(userId)
}
