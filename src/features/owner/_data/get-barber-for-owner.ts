import { db } from "@/src/lib/prisma"
import { cache } from "react"
import { getBarbershopsForUser } from "@/src/lib/authz"

export const getBarberForOwner = cache(
  async (barberId: string, ownerId: string) => {
    const barber = await db.barber.findUnique({
      where: { id: barberId },
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
    if (!barber) return null

    const ownerShop = await getBarbershopsForUser(ownerId, barber.barbershop.id)
    if (!ownerShop) return null

    return barber
  },
)
