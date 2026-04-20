import { db } from "@/src/lib/prisma"
import { cache } from "react"
import { requireBarbershopForOwner } from "@/src/lib/authz"

export const getOwnerBarbershopHours = cache(
  async (userId: string, barbershopId: string) => {
    await requireBarbershopForOwner(userId, barbershopId)

    const barbershop = await db.barbershop.findUnique({
      where: { id: barbershopId },
      include: {
        schedules: { orderBy: { dayOfWeek: "asc" } },
        breaks: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
        blockedSlots: { orderBy: { startAt: "asc" } },
      },
    })
    return barbershop
  },
)
