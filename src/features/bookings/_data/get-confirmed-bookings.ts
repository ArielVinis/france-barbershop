"use server"

import { auth } from "@/src/lib/auth"
import { db } from "../../../lib/prisma"
import { headers } from "next/headers"

export const getConfirmedBookings = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) return []

  return db.booking.findMany({
    where: {
      userId: session.user.id,
      date: { gte: new Date() },
      status: { in: ["CONFIRMED", "IN_PROGRESS"] },
    },
    include: {
      service: {
        include: {
          organization: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  })
}
