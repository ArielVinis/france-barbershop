"use server"

import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns"
import { db } from "@/src/lib/prisma"

export type OwnerBookingsPeriod = "day" | "week" | "month"

/**
 * Lista agendamentos das barbearias do dono.
 * @param barbershopIds - IDs das barbearias do dono (todas ou uma só)
 * @param options - barbershopId opcional para filtrar uma barbearia; period e date para o intervalo
 */
export async function getOwnerBookings(
  barbershopIds: string[],
  options: {
    barbershopId?: string | null
    period: OwnerBookingsPeriod
    date: Date
  },
) {
  const { period, date, barbershopId } = options
  const shopIds =
    barbershopId && barbershopIds.includes(barbershopId)
      ? [barbershopId]
      : barbershopIds
  if (shopIds.length === 0) return []

  const start =
    period === "day"
      ? startOfDay(date)
      : period === "week"
        ? startOfWeek(date, { weekStartsOn: 0 })
        : startOfMonth(date)
  const end =
    period === "day"
      ? endOfDay(date)
      : period === "week"
        ? endOfWeek(date, { weekStartsOn: 0 })
        : endOfMonth(date)

  return db.booking.findMany({
    where: {
      service: { barbershopId: { in: shopIds } },
      date: { gte: start, lte: end },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, image: true },
      },
      service: {
        select: {
          id: true,
          name: true,
          durationMinutes: true,
          price: true,
          barbershopId: true,
        },
      },
      barber: {
        select: {
          id: true,
          user: { select: { name: true } },
        },
      },
    },
    orderBy: { date: "asc" },
  })
}
