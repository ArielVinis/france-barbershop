import { cache } from "react"
import { Role } from "@/prisma/generated/prisma/enums"
import { memberRepository } from "@/src/features/member/member.repository"
import { ForbiddenError, NotFoundError } from "@/src/shared/errors/errors"
import {
  getOrganizationForOwner,
  getOrganizationsForOwner,
  requireOrganizationForOwner,
} from "@/src/shared/guards"

function mapInvitationRoleToUserRole(role: string | null | undefined): Role | null {
  switch (role?.toLowerCase()) {
    case "member":
      return Role.MEMBER
    case "manager":
      return Role.MANAGER
    case "owner":
      return Role.OWNER
    default:
      return null
  }
}

export const memberService = {
  async validateInvitationRecipient(
    organizationId: string,
    email: string,
    excludeUserId?: string,
  ) {
    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await memberRepository.findUserByEmail(normalizedEmail)

    if (existingUser && existingUser.id !== excludeUserId) {
      if (existingUser.members.length > 0) {
        throw new Error("Este usuário já é barbeiro em outra barbearia")
      }

      const existingInOrg = await memberRepository.findMemberInOrganization(
        organizationId,
        existingUser.id,
      )
      if (existingInOrg) {
        throw new Error("Este usuário já pertence a esta barbearia")
      }
    }

    return normalizedEmail
  },

  async validateInvitationAcceptance(
    organizationId: string,
    userId: string,
    invitationRole: string | null | undefined,
  ) {
    const mappedRole = mapInvitationRoleToUserRole(invitationRole)
    if (mappedRole !== Role.MEMBER) return

    const existingElsewhere =
      await memberRepository.findBarberMembershipElsewhere(
        userId,
        organizationId,
      )
    if (existingElsewhere) {
      throw new Error("Você já é barbeiro em outra barbearia")
    }
  },

  async finalizeMemberAfterInvitation(
    userId: string,
    invitationRole: string | null | undefined,
  ) {
    const mappedRole = mapInvitationRoleToUserRole(invitationRole)
    if (!mappedRole) return

    const user = await memberRepository.findUserRole(userId)
    if (!user) return

    if (user.role === Role.CLIENT) {
      await memberRepository.updateUserRole(userId, mappedRole)
    }
  },

  async prepareInvitation(
    ownerUserId: string,
    organizationId: string,
    email: string,
    role: Role,
  ) {
    const ownerOrganization = await requireOrganizationForOwner(
      ownerUserId,
      organizationId,
    )
    const normalizedEmail = await memberService.validateInvitationRecipient(
      ownerOrganization.id,
      email,
    )

    return {
      email: normalizedEmail,
      organizationId: ownerOrganization.id,
      role,
    }
  },

  async createBarberOwner(
    ownerUserId: string,
    organizationId: string,
    userEmail: string,
  ) {
    const ownerOrganization = await requireOrganizationForOwner(
      ownerUserId,
      organizationId,
    )

    const email = await memberService.validateInvitationRecipient(
      ownerOrganization.id,
      userEmail,
    )

    const existingUser = await memberRepository.findUserByEmail(email)
    if (!existingUser) {
      throw new Error("Nenhum usuário encontrado no sistema com este e-mail")
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
