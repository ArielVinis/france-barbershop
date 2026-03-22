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

export type OwnerStatsPeriod = "day" | "week" | "month"

export type OwnerDashboardStats = {
  revenue: number
  revenueBreakdown: {
    barbershopId: string
    barbershopName: string
    revenue: number
  }[]
  bookingsCount: number
  activeBarbersCount: number
  topServices: { serviceId: string; serviceName: string; count: number }[]
}

/**
 * Estatísticas do dashboard do dono: faturamento (PAID), total de agendamentos,
 * barbeiros cadastrados e top 5 serviços por quantidade no período.
 */
export async function getOwnerDashboardStats(
  barbershopIds: string[],
  options: {
    barbershopId?: string | null
    period: OwnerStatsPeriod
    date: Date
  },
): Promise<OwnerDashboardStats> {
  const { period, date, barbershopId } = options
  const shopIds =
    barbershopId && barbershopIds.includes(barbershopId)
      ? [barbershopId]
      : barbershopIds
  if (shopIds.length === 0) {
    return {
      revenue: 0,
      revenueBreakdown: [],
      bookingsCount: 0,
      activeBarbersCount: 0,
      topServices: [],
    }
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

  const [paidBookings, allBookingsForCount, barbersCount, servicesAgg] =
    await Promise.all([
      db.booking.findMany({
        where: {
          service: { barbershopId: { in: shopIds } },
          date: { gte: start, lte: end },
          paymentStatus: "PAID",
        },
        select: {
          service: {
            select: {
              price: true,
              barbershopId: true,
              barbershop: { select: { name: true } },
            },
          },
        },
      }),
      db.booking.findMany({
        where: {
          service: { barbershopId: { in: shopIds } },
          date: { gte: start, lte: end },
        },
        select: { id: true },
      }),
      db.barber.count({
        where: { barbershopId: { in: shopIds } },
      }),
      db.booking.groupBy({
        by: ["serviceId"],
        where: {
          service: { barbershopId: { in: shopIds } },
          date: { gte: start, lte: end },
        },
        _count: { id: true },
      }),
    ])

  const revenue = paidBookings.reduce(
    (sum, b) => sum + Number(b.service.price),
    0,
  )

  const revenueByShop = new Map<
    string,
    { barbershopName: string; revenue: number }
  >()
  for (const b of paidBookings) {
    const id = b.service.barbershopId
    const name = b.service.barbershop.name
    const prev = revenueByShop.get(id)
    const add = Number(b.service.price)
    revenueByShop.set(id, {
      barbershopName: name,
      revenue: (prev?.revenue ?? 0) + add,
    })
  }
  const revenueBreakdown = Array.from(revenueByShop.entries()).map(
    ([barbershopId, v]) => ({
      barbershopId,
      barbershopName: v.barbershopName,
      revenue: v.revenue,
    }),
  )

  const serviceIds = servicesAgg.map((s) => s.serviceId)
  const services =
    serviceIds.length > 0
      ? await db.barbershopService.findMany({
          where: { id: { in: serviceIds } },
          select: { id: true, name: true },
        })
      : []
  const serviceNames = new Map(services.map((s) => [s.id, s.name]))
  const topServices = servicesAgg
    .sort((a, b) => b._count.id - a._count.id)
    .slice(0, 5)
    .map((s) => ({
      serviceId: s.serviceId,
      serviceName: serviceNames.get(s.serviceId) ?? "—",
      count: s._count.id,
    }))

  return {
    revenue,
    revenueBreakdown,
    bookingsCount: allBookingsForCount.length,
    activeBarbersCount: barbersCount,
    topServices,
  }
}
