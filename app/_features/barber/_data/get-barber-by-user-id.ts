import { db } from "@/app/_lib/prisma"

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
          schedules: { orderBy: { dayOfWeek: "asc" } },
        },
      },
    },
  })
}
