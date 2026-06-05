import { db } from "@/src/lib/prisma"
import { cache } from "react"
import { requireOrganizationForOwner } from "@/src/lib/authz"

export const getOwnerOrganizationHours = cache(
  async (userId: string, organizationId: string) => {
    await requireOrganizationForOwner(userId, organizationId)

    return db.organization.findUnique({
      where: { id: organizationId },
      include: {
        schedules: { orderBy: { dayOfWeek: "asc" } },
        breaks: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
        blockedSlots: { orderBy: { startAt: "asc" } },
      },
    })
  },
)
