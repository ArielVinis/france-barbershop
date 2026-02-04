import { db } from "@/src/lib/prisma"

export async function getBarberByUserId(userId: string) {
  return db.barber.findUnique({
    where: { userId },
    include: {
      user: { select: { name: true, image: true, email: true } },
      barbershop: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          schedules: { orderBy: { dayOfWeek: "asc" } },
        },
      },
      schedules: { orderBy: { dayOfWeek: "asc" } },
      breaks: true,
      blockedSlots: { orderBy: { startAt: "asc" } },
    },
  })
}
