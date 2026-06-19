import { cache } from "react"
import { organizationRepository } from "@/src/features/organization/organization.repository"
import type {
  CreateOrganizationWithProfileInput,
  CreateOrganizationWithProfileResult,
} from "@/src/features/organization/organization.schema"
import { getOrganizationsForOwner } from "@/src/shared/guards"
import { Role } from "@/prisma/generated/prisma/enums"

export const organizationService = {
  async getOrganizations(userId: string) {
    return organizationRepository.findForUser(userId)
  },

  async getActiveOrganization(userId: string) {
    const memberUser = await organizationRepository.findActiveForUser(userId)
    if (!memberUser) return null
    return organizationRepository.findOrganizationById(
      memberUser.organizationId,
    )
  },

  async getOrganizationBySlug(slug?: string) {
    try {
      return await organizationRepository.findBySlugWithMembers(slug)
    } catch (error) {
      console.error(error)
      return null
    }
  },

  async getOrganizationById(id?: string) {
    try {
      return await organizationRepository.findByIdWithMembers(id)
    } catch (error) {
      console.error(error)
      return null
    }
  },

  getOwnerByUserId: cache(async (userId: string) => {
    const [user, organizations] = await Promise.all([
      organizationRepository.findUserProfile(userId),
      getOrganizationsForOwner(userId),
    ])

    if (!user) return null

    return { user, organizations }
  }),

  async createOrganizationWithProfile(
    input: CreateOrganizationWithProfileInput,
    user: { id: string; role: Role },
  ): Promise<CreateOrganizationWithProfileResult> {
    const slugTaken = await organizationRepository.findBySlug(input.slug)
    if (slugTaken) {
      return { success: false, error: "Este slug já está em uso" }
    }

    try {
      const organization = await organizationRepository.createWithOwner(
        input,
        user,
      )
      return { success: true, organizationId: organization.id }
    } catch (error) {
      console.error("createOrganizationWithProfile", error)
      return {
        success: false,
        error: "Não foi possível criar a barbearia. Tente novamente.",
      }
    }
  },
}
