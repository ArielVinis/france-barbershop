"use server"

import { getServerSession } from "next-auth"
import { db } from "../../../lib/prisma"
import { authOptions } from "../../../lib/auth"

export const getConcludedBookings = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  const now = new Date()
  return db.booking.findMany({
    where: {
      userId: (session.user as { id: string }).id,
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
