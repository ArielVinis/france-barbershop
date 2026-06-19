import { Role } from "@/prisma/generated/prisma/enums"
import { db } from "@/src/shared/lib/prisma"
import type { CreateOrganizationWithProfileInput } from "@/src/features/organization/organization.schema"

export const organizationRepository = {
  findBySlug(slug: string) {
    return db.organization.findUnique({
      where: { slug },
      select: { id: true },
    })
  },

  findBySlugWithMembers(slug?: string) {
    return db.organization.findFirst({
      where: { slug },
      include: { members: true },
    })
  },

  findByIdWithMembers(id?: string) {
    return db.organization.findFirst({
      where: { id },
      include: { members: true },
    })
  },

  findForUser(userId: string) {
    return db.organization.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
    })
  },

  findActiveForUser(userId: string) {
    return db.member.findFirst({
      where: { userId },
    })
  },

  findOrganizationById(id: string) {
    return db.organization.findFirst({
      where: { id },
    })
  },

  findUserProfile(userId: string) {
    return db.user.findUnique({
      where: { id: userId },
      select: { name: true, image: true, email: true },
    })
  },

  createWithOwner(
    data: CreateOrganizationWithProfileInput,
    user: { id: string; role: Role },
  ) {
    return db.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.name,
          slug: data.slug,
          logo: data.logo && data.logo !== "" ? data.logo : null,
          description: data.description,
          address: data.address,
          phones: data.phones,
        },
      })

      const existingMember = await tx.member.findFirst({
        where: {
          organizationId: org.id,
          userId: user.id,
        },
      })

      if (!existingMember) {
        await tx.member.create({
          data: {
            organizationId: org.id,
            userId: user.id,
            role: Role.OWNER,
            isActive: true,
          },
        })
      } else if (existingMember.role !== Role.OWNER) {
        await tx.member.update({
          where: { id: existingMember.id },
          data: { role: Role.OWNER, isActive: true },
        })
      }

      if (user.role === Role.CLIENT) {
        await tx.user.update({
          where: { id: user.id },
          data: { role: Role.OWNER },
        })
      }

      return org
    })
  },
}
