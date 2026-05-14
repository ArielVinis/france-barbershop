import { cache } from "react"
import { Role } from "@/prisma/generated/prisma/enums"
import { db } from "@/src/lib/prisma"

export const getBarbershopForUser = cache(
  async (userId: string, barbershopId: string) =>
    db.barbershop
      .findFirst({
        where: {
          id: barbershopId,
          organization: {
            members: {
              some: {
                userId,
                role: Role.OWNER,
              },
            },
          },
        },
        select: {
          id: true,
          organization: { select: { slug: true } },
        },
      })
      .then((row) =>
        row ? { id: row.id, slug: row.organization.slug } : null,
      ),
)

export const getBarbershopsForUser = cache(async (userId: string) =>
  db.barbershop.findMany({
    where: {
      organization: {
        members: {
          some: {
            userId,
            role: Role.OWNER,
          },
        },
      },
    },
    orderBy: { organization: { name: "asc" } },
    select: {
      id: true,
      organization: { select: { name: true, slug: true, logo: true } },
    },
  }),
)
