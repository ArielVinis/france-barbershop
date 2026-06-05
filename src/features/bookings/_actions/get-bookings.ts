"use server"

import { endOfDay, startOfDay } from "date-fns"
import { db } from "../../../lib/prisma"

interface GetBookingsProps {
  serviceId: string
  date: Date
  memberId?: string
}

export const getBookings = async ({
  date,
  serviceId,
  memberId,
}: GetBookingsProps) => {
  return db.booking.findMany({
    where: {
      serviceId,
      ...(memberId ? { memberId } : {}),
      date: {
        lte: endOfDay(date),
        gte: startOfDay(date),
      },
    },
  })
}
