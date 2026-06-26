"use server"

import { Role } from "@/prisma/generated/prisma/enums"
import { headers } from "next/headers"
import { memberRepository } from "@/src/features/member/member.repository"
import { memberService } from "@/src/features/member/member.service"
import { SendInvitationSchema } from "@/src/features/member/member.schema"
import { isAdmin } from "@/src/server/auth/permissions"
import { getCurrentUser } from "@/src/server/auth/users"
import { auth } from "@/src/shared/lib/auth"

export const addMember = async (
  userId: string,
  organizationId: string,
  role: Role,
) => {
  try {
    await auth.api.addMember({
      body: {
        userId,
        role,
        organizationId,
      },
    })
    return {
      success: true,
      message: "Member added successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: error || "Failed to add member",
    }
  }
}

export const removeMember = async (memberId: string) => {
  const admin = await isAdmin()
  if (!admin) {
    return {
      success: false,
      error: "You are not authorized to remove members",
    }
  }

  try {
    await memberRepository.delete(memberId)
    return {
      success: true,
      message: "Member removed successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: error || "Failed to remove member",
    }
  }
}

export const sendInvitationMember = async (
  email: string,
  role: Role,
  organizationId: string,
) => {
  const parsed = SendInvitationSchema.safeParse({ email, organizationId })
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    }
  }

  try {
    const { user } = await getCurrentUser()
    const normalizedEmail = await memberService.prepareInvitationOwner(
      user.id,
      parsed.data.organizationId,
      parsed.data.email,
    )

    await auth.api.createInvitation({
      body: {
        email: normalizedEmail,
        role,
        organizationId: parsed.data.organizationId,
        resend: true,
      },
      headers: await headers(),
    })
    return {
      success: true,
      message: "Invitation sent successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send invitation member",
    }
  }
}
