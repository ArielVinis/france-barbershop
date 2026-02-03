"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { db } from "../../../lib/prisma"

export const getConfirmedBookings = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return []
  }
  return db.booking.findMany({
    where: {
      userId: (session.user as { id: string }).id,
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
