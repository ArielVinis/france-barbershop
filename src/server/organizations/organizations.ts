"use server"

import { db } from "@/src/lib/prisma"
import { getCurrentUser } from "../auth/users"

export async function getOrganizations() {
  const { user } = await getCurrentUser()

  const organizations = await db.organization.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
  })
  return organizations
}

export async function getActiveOrganization(userId: string) {
  const memberUser = await db.member.findFirst({
    where: {
      userId,
    },
  })

  if (!memberUser) {
    return null
  }

  const activeOrganization = await db.organization.findFirst({
    where: {
      id: memberUser.organizationId,
    },
  })
  return activeOrganization
}

export async function getOrganizationBySlug(slug?: string) {
  try {
    const organizationBySlug = await db.organization.findFirst({
      where: {
        slug,
      },
      include: {
        members: true,
      },
    })

    return organizationBySlug
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getOrganizationById(id?: string) {
  try {
    const organizationById = await db.organization.findFirst({
      where: {
        id,
      },
      include: {
        members: true,
      },
    })

    return organizationById
  } catch (error) {
    console.error(error)
    return null
  }
}
