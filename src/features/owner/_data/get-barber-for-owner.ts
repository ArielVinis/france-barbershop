import { db } from "@/src/lib/prisma"
import { cache } from "react"

export const getBarberForOwner = cache(
  async (barberId: string, ownerUserId: string) => {
    const barber = await db.barber.findFirst({
      where: {
        id: barberId,
        barbershop: {
          owners: { some: { id: ownerUserId } },
        },
      },
      include: {
        user: { select: { name: true, email: true } },
        barbershop: {
          select: {
            id: true,
            name: true,
            slug: true,
            schedules: { orderBy: { dayOfWeek: "asc" } },
          },
        },
        schedules: { orderBy: { dayOfWeek: "asc" } },
        breaks: true,
        blockedSlots: { orderBy: { startAt: "asc" } },
      },
    })
    return barber
  },
)
