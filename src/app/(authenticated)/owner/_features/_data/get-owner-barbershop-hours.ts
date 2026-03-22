import { db } from "@/src/lib/prisma"
import { cache } from "react"

export const getOwnerBarbershopHours = cache(
  async (userId: string, barbershopId: string) => {
    const barbershop = await db.barbershop.findFirst({
      where: {
        id: barbershopId,
        owners: { some: { id: userId } },
      },
      include: {
        schedules: { orderBy: { dayOfWeek: "asc" } },
        breaks: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
        blockedSlots: { orderBy: { startAt: "asc" } },
      },
    })
    return barbershop
  },
)
