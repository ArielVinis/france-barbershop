import { db } from "@/src/lib/prisma"
import { cache } from "react"
import {
  getBarbershopsForUser,
  requireBarbershopForOwner,
} from "@/src/lib/authz"

/**
 * Lista serviços das barbearias do dono.
 *
 * `barbershopId` opcional restringe por ID validado em `authz`.
 */
export const getOwnerServices = cache(
  async (ownerUserId: string, barbershopId?: string) => {
    const scopedShopIds = barbershopId
      ? [(await requireBarbershopForOwner(ownerUserId, barbershopId)).id]
      : (await getBarbershopsForUser(ownerUserId)).map((shop) => shop.id)

    if (scopedShopIds.length === 0) return []

    const services = await db.barbershopService.findMany({
      where: {
        barbershopId: { in: scopedShopIds },
      },
      orderBy: [{ barbershop: { name: "asc" } }, { name: "asc" }],
      include: {
        barbershop: { select: { id: true, name: true, slug: true } },
      },
    })
    return services
  },
)
