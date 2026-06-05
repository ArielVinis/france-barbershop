import { Role } from "@/prisma/generated/prisma/enums"
import { db } from "@/src/lib/prisma"
import { cache } from "react"
import {
  getOrganizationsForOwner,
  requireOrganizationForOwner,
} from "@/src/lib/authz"

export const getOwnerBarbers = cache(
  async (ownerUserId: string, organizationId?: string) => {
    const scopedOrganizationIds = organizationId
      ? [(await requireOrganizationForOwner(ownerUserId, organizationId)).id]
      : (await getOrganizationsForOwner(ownerUserId)).map((org) => org.id)

    if (scopedOrganizationIds.length === 0) return []

    return db.member.findMany({
      where: {
        organizationId: { in: scopedOrganizationIds },
        role: Role.MEMBER,
      },
      orderBy: [
        { organization: { name: "asc" } },
        { createdAt: "asc" },
      ],
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
    })
  },
)
