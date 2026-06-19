import { Role } from "@/prisma/generated/prisma/enums"
import { db } from "@/src/shared/lib/prisma"

export const devRepository = {
  findOrganization(organizationId: string) {
    return db.organization.findUnique({
      where: { id: organizationId },
      select: { id: true },
    })
  },

  setUserAsOwner(userId: string, organizationId: string) {
    return db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { role: Role.OWNER },
      })

      const existing = await tx.member.findFirst({
        where: {
          organizationId,
          userId,
        },
      })

      if (existing) {
        await tx.member.update({
          where: { id: existing.id },
          data: { role: Role.OWNER },
        })
      } else {
        await tx.member.create({
          data: {
            organizationId,
            userId,
            role: Role.OWNER,
          },
        })
      }
    })
  },
}
