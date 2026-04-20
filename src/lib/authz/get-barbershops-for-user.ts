import { cache } from "react"
import { db } from "@/src/lib/prisma"

export type OwnerBarbershopLookup = { id: string; slug: string }
export type OwnerBarbershopListItem = { id: string; name: string; slug: string }

const getBarbershopsForUserImpl = cache(
  async (userId: string, barbershopId?: string) => {
    if (barbershopId) {
      return db.barbershop.findFirst({
        where: {
          id: barbershopId,
          owners: { some: { id: userId } },
        },
        select: { id: true, slug: true },
      })
    }

    return db.barbershop.findMany({
      where: { owners: { some: { id: userId } } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    })
  },
)

type GetBarbershopsForUser = {
  (userId: string, barbershopId: string): Promise<OwnerBarbershopLookup | null>
  (userId: string): Promise<OwnerBarbershopListItem[]>
}

export const getBarbershopsForUser =
  getBarbershopsForUserImpl as GetBarbershopsForUser
