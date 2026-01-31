"use server"

import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns"
import { db } from "@/src/lib/prisma"

type Period = "day" | "week"

export async function getBarberBookings(
  barberId: string,
  period: Period,
  date: Date,
) {
  const start =
    period === "day" ? startOfDay(date) : startOfWeek(date, { weekStartsOn: 0 })
  const end =
    period === "day" ? endOfDay(date) : endOfWeek(date, { weekStartsOn: 0 })

  return db.booking.findMany({
    where: {
      barberId,
      date: {
        gte: start,
        lte: end,
      },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, image: true },
      },
      service: {
        select: { id: true, name: true, durationMinutes: true, price: true },
      },
    },
    orderBy: { date: "asc" },
  })
}
