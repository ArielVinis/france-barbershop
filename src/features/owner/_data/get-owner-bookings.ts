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
import { resolveOwnerShopIdsForQueries } from "@/src/lib/panel/resolve-owner-shop-ids"
import type { OwnerBarbershopIdList } from "@/src/types/panel-data-scope"

export type OwnerBookingsPeriod = "day" | "week" | "month"

/**
 * Lista agendamentos das barbearias do dono.
 *
 * @param barbershopIds - Conjunto de lojas do dono (`OwnerBarbershopIdList`).
 * @param options.barbershopId - Filtro opcional; só aplica se estiver em `barbershopIds`.
 */
export async function getOwnerBookings(
  barbershopIds: OwnerBarbershopIdList,
  options: {
    barbershopId?: string | null
    barberId?: string | null
    period: OwnerBookingsPeriod
    date: Date
  },
) {
  const { period, date, barbershopId, barberId } = options
  const shopIds = resolveOwnerShopIdsForQueries(barbershopIds, barbershopId)
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
      ...(barberId ? { barberId } : {}),
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
