import { cache } from "react"
import { memberRepository } from "@/src/features/member/member.repository"
import { ForbiddenError, NotFoundError } from "@/src/shared/errors/errors"
import {
  getOrganizationForOwner,
  getOrganizationsForOwner,
  requireOrganizationForOwner,
} from "@/src/shared/guards"

export const memberService = {
  async createBarberOwner(
    ownerUserId: string,
    organizationId: string,
    userEmail: string,
  ) {
    const ownerOrganization = await requireOrganizationForOwner(
      ownerUserId,
      organizationId,
    )

    const existingUser = await memberRepository.findUserByEmail(
      userEmail.trim().toLowerCase(),
    )
    if (!existingUser)
      throw new Error("Nenhum usuário encontrado no sistema com este e-mail")
    if (existingUser.members.length > 0)
      throw new Error("Este usuário já é barbeiro em outra barbearia")

    const existingInOrg = await memberRepository.findMemberInOrganization(
      ownerOrganization.id,
      existingUser.id,
    )
    if (existingInOrg) {
      throw new Error("Este usuário já pertence a esta barbearia")
    }

    await memberRepository.createBarber({
      userId: existingUser.id,
      organizationId: ownerOrganization.id,
    })
  },

  async deleteBarberOwner(ownerUserId: string, barberId: string) {
    const barber = await memberRepository.findByIdSelect(barberId)
    if (!barber) throw new NotFoundError("Barbeiro não encontrado")

    try {
      await requireOrganizationForOwner(ownerUserId, barber.organizationId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ForbiddenError("Você não tem acesso a este barbeiro")
      }
      throw error
    }

    await memberRepository.delete(barberId)
  },

  async toggleBarberActiveOwner(ownerUserId: string, barberId: string) {
    const barber = await memberRepository.findByIdSelect(barberId)
    if (!barber) throw new NotFoundError("Barbeiro não encontrado")

    try {
      await requireOrganizationForOwner(ownerUserId, barber.organizationId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new ForbiddenError("Você não tem acesso a este barbeiro")
      }
      throw error
    }

    await memberRepository.updateActive(barberId, !barber.isActive)
  },

  getBarberForOwner: cache(async (barberId: string, ownerId: string) => {
    const member = await memberRepository.findBarberMember(barberId)
    if (!member) return null

    const ownerOrg = await getOrganizationForOwner(ownerId, member.organizationId)
    if (!ownerOrg) return null

    return {
      user: member.user,
      organization: member.organization,
      schedules: member.organization.schedules,
      breaks: member.organization.breaks,
      blockedSlots: member.organization.blockedSlots,
    }
  }),

  getBarberByUserId: cache(async (userId: string) => {
    const member = await memberRepository.findBarberByUserId(userId)
    if (!member) return null

    return {
      id: member.id,
      userId: member.userId,
      isActive: member.isActive,
      organizationId: member.organizationId,
      user: member.user,
      organization: member.organization,
      schedules: member.organization.schedules,
      breaks: member.organization.breaks,
      blockedSlots: member.organization.blockedSlots,
    }
  }),

  getOwnerBarbers: cache(
    async (ownerUserId: string, organizationId?: string) => {
      const scopedOrganizationIds = organizationId
        ? [(await requireOrganizationForOwner(ownerUserId, organizationId)).id]
        : (await getOrganizationsForOwner(ownerUserId)).map((org) => org.id)

      if (scopedOrganizationIds.length === 0) return []

      return memberRepository.findOwnerBarbers(scopedOrganizationIds)
    },
  ),

  async getBarberScheduleForOwner(barberId: string, ownerUserId: string) {
    return memberService.getBarberForOwner(barberId, ownerUserId)
  },
}
