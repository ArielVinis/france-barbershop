"use server"

import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
} from "date-fns"
import { db } from "@/src/lib/prisma"
import type { OwnerChartPeriod } from "@/src/features/owner/_data/get-owner-chart-data"
import type {
  BookingsChartPoint,
  DistributionByBarber,
  DistributionByService,
  RevenueChartPoint,
} from "@/src/features/owner/_data/get-owner-chart-data"

function bookingScopeWhere(barbershopId: string, barberId: string) {
  return { barberId, service: { barbershopId } }
}

export async function getBarberChartDataRevenue(
  scope: { barbershopId: string; barberId: string },
  options: { period: OwnerChartPeriod; date: Date },
): Promise<RevenueChartPoint[]> {
  const { barbershopId, barberId } = scope
  const { period, date } = options

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

  const days = eachDayOfInterval({ start, end })
  const bookings = await db.booking.findMany({
    where: {
      ...bookingScopeWhere(barbershopId, barberId),
      date: { gte: start, lte: end },
      paymentStatus: "PAID",
    },
    select: { date: true, service: { select: { price: true } } },
  })

  const byDay = new Map<string, number>()
  for (const d of days) {
    byDay.set(format(d, "yyyy-MM-dd"), 0)
  }
  for (const b of bookings) {
    const key = format(b.date, "yyyy-MM-dd")
    const current = byDay.get(key) ?? 0
    byDay.set(key, current + Number(b.service.price))
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }))
}

export async function getBarberChartDataBookings(
  scope: { barbershopId: string; barberId: string },
  options: { period: OwnerChartPeriod; date: Date },
): Promise<BookingsChartPoint[]> {
  const { barbershopId, barberId } = scope
  const { period, date } = options

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

  const bookings = await db.booking.findMany({
    where: {
      ...bookingScopeWhere(barbershopId, barberId),
      date: { gte: start, lte: end },
    },
    select: { date: true },
  })

  const byDay = new Map<string, number>()
  for (const b of bookings) {
    const key = format(b.date, "yyyy-MM-dd")
    byDay.set(key, (byDay.get(key) ?? 0) + 1)
  }

  const days = eachDayOfInterval({ start, end })
  return days.map((d) => {
    const key = format(d, "yyyy-MM-dd")
    return { date: key, count: byDay.get(key) ?? 0 }
  })
}

export async function getBarberChartDataDistribution(
  scope: { barbershopId: string; barberId: string },
  options: { period: OwnerChartPeriod; date: Date },
): Promise<{
  byService: DistributionByService[]
  byBarber: DistributionByBarber[]
}> {
  const { barbershopId, barberId } = scope
  const { period, date } = options

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

  const [byServiceAgg, selfName] = await Promise.all([
    db.booking.groupBy({
      by: ["serviceId"],
      where: {
        ...bookingScopeWhere(barbershopId, barberId),
        date: { gte: start, lte: end },
      },
      _count: { id: true },
    }),
    db.barber.findUnique({
      where: { id: barberId },
      select: { user: { select: { name: true } } },
    }),
  ])

  const serviceIds = byServiceAgg.map((s) => s.serviceId).filter(Boolean)
  const services =
    serviceIds.length > 0
      ? await db.barbershopService.findMany({
          where: { id: { in: serviceIds } },
          select: { id: true, name: true },
        })
      : []
  const serviceNames = new Map(services.map((s) => [s.id, s.name]))

  const byService = byServiceAgg
    .map((s) => ({
      name: serviceNames.get(s.serviceId) ?? "—",
      count: s._count.id,
    }))
    .sort((a, b) => b.count - a.count)

  const total = byService.reduce((a, s) => a + s.count, 0)
  const byBarber: DistributionByBarber[] =
    total > 0
      ? [
          {
            name: selfName?.user?.name ?? "Você",
            count: total,
          },
        ]
      : []

  return { byService, byBarber }
}
