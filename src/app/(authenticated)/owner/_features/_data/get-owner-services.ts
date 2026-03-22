import { db } from "@/src/lib/prisma"
import { cache } from "react"

/**
 * Lista serviços das barbearias do dono.
 * Filtro opcional por barbershopId (deve pertencer ao dono).
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
