import { db } from "@/src/lib/prisma"
import { cache } from "react"
import {
  getOrganizationsForOwner,
  requireOrganizationForOwner,
} from "@/src/lib/authz"

/**
 * Lista serviços das organizações (barbearias) do dono.
 *
 * `organizationId` opcional restringe por ID validado em `authz`.
 */
export const getOwnerServices = cache(
  async (ownerUserId: string, organizationId?: string) => {
    const scopedOrganizationIds = organizationId
      ? [(await requireOrganizationForOwner(ownerUserId, organizationId)).id]
      : (await getOrganizationsForOwner(ownerUserId)).map((org) => org.id)

    if (scopedOrganizationIds.length === 0) return []

    return db.organizationService.findMany({
      where: {
        organizationId: { in: scopedOrganizationIds },
      },
      orderBy: [{ organization: { name: "asc" } }, { name: "asc" }],
      include: {
        organization: { select: { id: true, name: true, slug: true } },
      },
    })
  },
)
