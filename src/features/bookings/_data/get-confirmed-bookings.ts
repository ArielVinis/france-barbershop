"use server"

import { getSession } from "@/src/lib/auth"
import { db } from "../../../lib/prisma"

export const getConfirmedBookings = async () => {
  const session = await getSession()
  if (!session?.user) {
    return []
  }
  return db.booking.findMany({
    where: {
      userId: session.user.id,
      date: { gte: new Date() },
      status: { in: ["CONFIRMED", "IN_PROGRESS"] },
    },
    include: {
      service: {
        include: {
          barbershop: true,
        },
      },
      barber: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  })
}
