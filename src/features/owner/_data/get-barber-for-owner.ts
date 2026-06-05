import { Role } from "@/prisma/generated/prisma/enums"
import { db } from "@/src/lib/prisma"
import { cache } from "react"
import { getOrganizationForOwner } from "@/src/lib/authz"

export const getBarberForOwner = cache(
  async (barberId: string, ownerId: string) => {
    const member = await db.member.findFirst({
      where: { id: barberId, role: Role.MEMBER },
      include: {
        user: { select: { name: true, email: true } },
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            schedules: { orderBy: { dayOfWeek: "asc" } },
            breaks: true,
            blockedSlots: { orderBy: { startAt: "asc" } },
          },
        },
      },
    })
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
  },
)
