import { cache } from "react"
import { db } from "@/src/lib/prisma"

export const getBarbershopForUser = cache(
  async (userId: string, barbershopId: string) =>
    db.barbershop.findFirst({
      where: {
        id: barbershopId,
        owners: { some: { id: userId } },
      },
      select: { id: true, slug: true },
    }),
)

export const getBarbershopsForUser = cache(async (userId: string) =>
  db.barbershop.findMany({
    where: { owners: { some: { id: userId } } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  }),
)
