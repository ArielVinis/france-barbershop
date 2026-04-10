import { db } from "@/src/lib/prisma"
import { cache } from "react"

export const getOwnerBarbers = cache(
  async (ownerUserId: string, barbershopId?: string) => {
    const barbers = await db.barber.findMany({
      where: {
        barbershop: {
          owners: { some: { id: ownerUserId } },
          ...(barbershopId ? { id: barbershopId } : {}),
        },
      },
      orderBy: [{ barbershop: { name: "asc" } }, { createdAt: "asc" }],
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        barbershop: { select: { id: true, name: true, slug: true } },
      },
    })
    return barbers
  },
)
