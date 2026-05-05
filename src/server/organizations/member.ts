"use server"

import { Role } from "@/prisma/generated/prisma/enums"
import { auth } from "../../lib/auth"
import { db } from "@/src/lib/prisma"
import { isAdmin } from "../auth/permissions"

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
  } catch (error) {
    console.error(error)
    throw new Error("Failed to add member")
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
    await db.member.delete({
      where: {
        id: memberId,
      },
    })
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
