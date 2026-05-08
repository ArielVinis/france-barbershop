"use server"

import { db } from "../../../lib/prisma"
import { getCurrentUser } from "@/src/server/auth/users"

export const getConcludedBookings = async () => {
  const { user } = await getCurrentUser()
  if (!user) return []
  const now = new Date()
  return db.booking.findMany({
    where: {
      userId: user.id,
      OR: [
        { date: { lt: now } },
        { status: { in: ["FINISHED", "CANCELLED", "NO_SHOW"] } },
      ],
    },
    include: {
      service: {
        include: {
          barbershop: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  })
}
