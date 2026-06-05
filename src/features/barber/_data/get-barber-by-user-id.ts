import { Role } from "@/prisma/generated/prisma/enums"
import { db } from "@/src/lib/prisma"
import { cache } from "react"

export const getBarberByUserId = cache(async (userId: string) => {
  const member = await db.member.findFirst({
    where: { userId, role: Role.MEMBER },
    include: {
      user: { select: { name: true, image: true, email: true } },
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          schedules: { orderBy: { dayOfWeek: "asc" } },
          breaks: true,
          blockedSlots: { orderBy: { startAt: "asc" } },
        },
      },
    },
  })

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
})
