import { db } from "@/src/lib/prisma"
import { cache } from "react"
import {
  getBarbershopsForUser,
  requireBarbershopForOwner,
} from "@/src/lib/authz"

export const getOwnerBarbers = cache(
  async (ownerUserId: string, barbershopId?: string) => {
    const scopedShopIds = barbershopId
      ? [(await requireBarbershopForOwner(ownerUserId, barbershopId)).id]
      : (await getBarbershopsForUser(ownerUserId)).map((shop) => shop.id)

    if (scopedShopIds.length === 0) return []

    const barbers = await db.barber.findMany({
      where: {
        barbershopId: { in: scopedShopIds },
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
