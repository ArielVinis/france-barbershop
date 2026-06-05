"use server"

import { auth } from "@/src/lib/auth"
import { db } from "../../../lib/prisma"
import { headers } from "next/headers"

export const getConcludedBookings = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) return []

  return db.booking.findMany({
    where: {
      userId: session.user.id,
      OR: [
        { date: { lt: new Date() } },
        { status: { in: ["FINISHED", "CANCELLED", "NO_SHOW"] } },
      ],
    },
    include: {
      service: {
        include: {
          organization: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  })
}
