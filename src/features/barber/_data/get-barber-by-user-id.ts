import { db } from "@/src/lib/prisma"
import { cache } from "react"

export const getBarberByUserId = cache(async (userId: string) => {
  const barber = await db.barber.findUnique({
    where: { userId },
    include: {
      user: { select: { name: true, image: true, email: true } },
      barbershop: {
        select: {
          id: true,
          organization: { select: { name: true, slug: true, logo: true } },
          schedules: { orderBy: { dayOfWeek: "asc" } },
        },
      },
      schedules: { orderBy: { dayOfWeek: "asc" } },
      breaks: true,
      blockedSlots: { orderBy: { startAt: "asc" } },
    },
  })

  if (!barber) return null

  return barber
})
