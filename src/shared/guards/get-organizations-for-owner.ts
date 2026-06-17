import { cache } from "react"
import { Role } from "@/prisma/generated/prisma/enums"
import { db } from "@/src/shared/lib/prisma"

export const getOrganizationForOwner = cache(
  async (userId: string, organizationId: string) =>
    db.organization
      .findFirst({
        where: {
          id: organizationId,
          members: {
            some: {
              userId,
              role: Role.OWNER,
            },
          },
        },
        select: { id: true, slug: true },
      })
      .then((row) => (row ? { id: row.id, slug: row.slug } : null)),
)

export const getOrganizationsForOwner = cache(async (userId: string) =>
  db.organization.findMany({
    where: {
      members: {
        some: {
          userId,
          role: Role.OWNER,
        },
      },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
    },
  }),
)
