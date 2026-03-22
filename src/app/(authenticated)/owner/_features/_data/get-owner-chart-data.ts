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

export type OwnerChartPeriod = "day" | "week" | "month"

/** Um ponto no tempo para gráfico de faturamento */
export type RevenueChartPoint = { date: string; revenue: number }

/** Um ponto no tempo para gráfico de agendamentos */
export type BookingsChartPoint = { date: string; count: number }

/**
 * Dados para gráfico de faturamento ao longo do tempo (por dia no intervalo).
 * Considera apenas bookings com paymentStatus PAID.
 */
export async function getOwnerChartDataRevenue(
  barbershopIds: string[],
  options: {
    barbershopId?: string | null
    period: OwnerChartPeriod
    date: Date
  },
): Promise<RevenueChartPoint[]> {
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

  const days = eachDayOfInterval({ start, end })
  const bookings = await db.booking.findMany({
    where: {
      service: { barbershopId: { in: shopIds } },
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

/**
 * Dados para gráfico de quantidade de agendamentos ao longo do tempo (por dia).
 */
export async function getOwnerChartDataBookings(
  barbershopIds: string[],
  options: {
    barbershopId?: string | null
    period: OwnerChartPeriod
    date: Date
  },
): Promise<BookingsChartPoint[]> {
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

  const bookings = await db.booking.findMany({
    where: {
      service: { barbershopId: { in: shopIds } },
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

export type DistributionByService = { name: string; count: number }
export type DistributionByBarber = { name: string; count: number }

/**
 * Distribuição de agendamentos por serviço e por barbeiro no período.
 */
export async function getOwnerChartDataDistribution(
  barbershopIds: string[],
  options: {
    barbershopId?: string | null
    period: OwnerChartPeriod
    date: Date
  },
): Promise<{
  byService: DistributionByService[]
  byBarber: DistributionByBarber[]
}> {
  const { period, date, barbershopId } = options
  const shopIds =
    barbershopId && barbershopIds.includes(barbershopId)
      ? [barbershopId]
      : barbershopIds
  if (shopIds.length === 0) {
    return { byService: [], byBarber: [] }
  }

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

  const [byServiceAgg, byBarberAgg] = await Promise.all([
    db.booking.groupBy({
      by: ["serviceId"],
      where: {
        service: { barbershopId: { in: shopIds } },
        date: { gte: start, lte: end },
      },
      _count: { id: true },
    }),
    db.booking.groupBy({
      by: ["barberId"],
      where: {
        service: { barbershopId: { in: shopIds } },
        date: { gte: start, lte: end },
        barberId: { not: null },
      },
      _count: { id: true },
    }),
  ])

  const serviceIds = byServiceAgg.map((s) => s.serviceId).filter(Boolean)
  const barberIds = byBarberAgg
    .map((b) => b.barberId)
    .filter(Boolean) as string[]

  const [services, barbers] = await Promise.all([
    serviceIds.length > 0
      ? db.barbershopService.findMany({
          where: { id: { in: serviceIds } },
          select: { id: true, name: true },
        })
      : [],
    barberIds.length > 0
      ? db.barber.findMany({
          where: { id: { in: barberIds } },
          select: { id: true, user: { select: { name: true } } },
        })
      : [],
  ])

  const serviceNames = new Map(services.map((s) => [s.id, s.name]))
  const barberNames = new Map(barbers.map((b) => [b.id, b.user?.name ?? "—"]))

  const byService = byServiceAgg
    .map((s) => ({
      name: serviceNames.get(s.serviceId) ?? "—",
      count: s._count.id,
    }))
    .sort((a, b) => b.count - a.count)

  const byBarber = byBarberAgg
    .map((b) => ({
      name: barberNames.get(b.barberId!) ?? "—",
      count: b._count.id,
    }))
    .sort((a, b) => b.count - a.count)

  return { byService, byBarber }
}
