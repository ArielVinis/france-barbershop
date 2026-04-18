import { db } from "@/src/lib/prisma"
import { cache } from "react"

/**
 * Lista serviços das barbearias do dono.
 *
 * `barbershopId` opcional restringe por ID; a query exige `owners: some(ownerUserId)`,
 * por isso IDs de lojas alheias devolvem lista vazia (não confundir com validação em mutações:
 * aí use `getBarbershopForOwner` / `resolvePanelContext`).
 */
export const getOwnerServices = cache(
  async (ownerUserId: string, barbershopId?: string) => {
    const services = await db.barbershopService.findMany({
      where: {
        barbershop: {
          owners: { some: { id: ownerUserId } },
          ...(barbershopId ? { id: barbershopId } : {}),
        },
      },
      orderBy: [{ barbershop: { name: "asc" } }, { name: "asc" }],
      include: {
        barbershop: { select: { id: true, name: true, slug: true } },
      },
    })
    return services
  },
)
