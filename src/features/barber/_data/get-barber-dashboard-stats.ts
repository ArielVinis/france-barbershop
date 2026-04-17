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
import type {
  OwnerDashboardStats,
  OwnerStatsPeriod,
} from "@/src/features/owner/_data/get-owner-dashboard-stats"

/**
 * Estatísticas do dashboard escopadas a um barbeiro (mesma forma que o dono,
 * com `activeBarbersCount` = 1 e breakdown da única loja do vínculo).
 * `barberId` e `barbershopId` devem vir de `getBarberForUser` / contexto já validado.
 */
export async function getBarberDashboardStats(
  scope: { barbershopId: string; barberId: string },
  options: { period: OwnerStatsPeriod; date: Date },
): Promise<OwnerDashboardStats> {
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

  const baseBookingWhere = {
    barberId,
    service: { barbershopId },
    date: { gte: start, lte: end },
  }

  const [paidBookings, allBookingsForCount, shopNameRow, servicesAgg] =
    await Promise.all([
      db.booking.findMany({
        where: { ...baseBookingWhere, paymentStatus: "PAID" as const },
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
        where: baseBookingWhere,
        select: { id: true },
      }),
      db.barbershop.findUnique({
        where: { id: barbershopId },
        select: { name: true },
      }),
      db.booking.groupBy({
        by: ["serviceId"],
        where: baseBookingWhere,
        _count: { id: true },
      }),
    ])

  const revenue = paidBookings.reduce(
    (sum, b) => sum + Number(b.service.price),
    0,
  )

  const shopName = shopNameRow?.name ?? "Barbearia"
  const revenueBreakdown = [
    {
      barbershopId,
      barbershopName: shopName,
      revenue,
    },
  ]

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
    activeBarbersCount: 1,
    topServices,
  }
}
