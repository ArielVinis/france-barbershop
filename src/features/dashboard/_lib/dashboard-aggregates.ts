import { format } from "date-fns"
import type {
  BookingsChartPoint,
  DistributionByBarber,
  DistributionByService,
  OwnerDashboardStats,
  RevenueChartPoint,
} from "@/src/features/dashboard/dashboard.types"

type PaidBookingRow = {
  date: Date
  service: {
    price: unknown
    organizationId: string
    organization: { name: string }
  }
}

type BookingDateRow = { date: Date }

type ServiceAggRow = { serviceId: string; _count: { id: number } }

type MemberAggRow = { memberId: string | null; _count: { id: number } }

export function buildRevenueChart(
  paidBookings: PaidBookingRow[],
  days: Date[],
): RevenueChartPoint[] {
  const byDay = new Map<string, number>()
  for (const d of days) {
    byDay.set(format(d, "yyyy-MM-dd"), 0)
  }
  for (const b of paidBookings) {
    const key = format(b.date, "yyyy-MM-dd")
    byDay.set(key, (byDay.get(key) ?? 0) + Number(b.service.price))
  }
  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }))
}

export function buildBookingsChart(
  bookings: BookingDateRow[],
  days: Date[],
): BookingsChartPoint[] {
  const byDay = new Map<string, number>()
  for (const b of bookings) {
    const key = format(b.date, "yyyy-MM-dd")
    byDay.set(key, (byDay.get(key) ?? 0) + 1)
  }
  return days.map((d) => {
    const key = format(d, "yyyy-MM-dd")
    return { date: key, count: byDay.get(key) ?? 0 }
  })
}

export function buildRevenueBreakdown(paidBookings: PaidBookingRow[]) {
  const revenueByShop = new Map<
    string,
    { barbershopName: string; revenue: number }
  >()
  for (const b of paidBookings) {
    const id = b.service.organizationId
    const name = b.service.organization.name
    const prev = revenueByShop.get(id)
    const add = Number(b.service.price)
    revenueByShop.set(id, {
      barbershopName: name,
      revenue: (prev?.revenue ?? 0) + add,
    })
  }
  return Array.from(revenueByShop.entries()).map(
    ([organizationId, v]) => ({
      organizationId,
      barbershopName: v.barbershopName,
      revenue: v.revenue,
    }),
  )
}

export function buildTopServices(
  servicesAgg: ServiceAggRow[],
  serviceNames: Map<string, string>,
) {
  return servicesAgg
    .sort((a, b) => b._count.id - a._count.id)
    .slice(0, 5)
    .map((s) => ({
      serviceId: s.serviceId,
      serviceName: serviceNames.get(s.serviceId) ?? "—",
      count: s._count.id,
    }))
}

export function buildDistributionByService(
  servicesAgg: ServiceAggRow[],
  serviceNames: Map<string, string>,
): DistributionByService[] {
  return servicesAgg
    .map((s) => ({
      name: serviceNames.get(s.serviceId) ?? "—",
      count: s._count.id,
    }))
    .sort((a, b) => b.count - a.count)
}

export function buildDistributionByBarber(
  byMemberAgg: MemberAggRow[],
  memberNames: Map<string, string>,
): DistributionByBarber[] {
  return byMemberAgg
    .map((b) => ({
      name: memberNames.get(b.memberId!) ?? "—",
      count: b._count.id,
    }))
    .sort((a, b) => b.count - a.count)
}

export function buildOwnerStats(params: {
  paidBookings: PaidBookingRow[]
  bookingsCount: number
  activeBarbersCount: number
  servicesAgg: ServiceAggRow[]
  serviceNames: Map<string, string>
}): OwnerDashboardStats {
  const revenue = params.paidBookings.reduce(
    (sum, b) => sum + Number(b.service.price),
    0,
  )

  return {
    revenue,
    revenueBreakdown: buildRevenueBreakdown(params.paidBookings),
    bookingsCount: params.bookingsCount,
    activeBarbersCount: params.activeBarbersCount,
    topServices: buildTopServices(params.servicesAgg, params.serviceNames),
  }
}

export const EMPTY_OWNER_DASHBOARD_BUNDLE = {
  stats: {
    revenue: 0,
    revenueBreakdown: [],
    bookingsCount: 0,
    activeBarbersCount: 0,
    topServices: [],
  },
  chartRevenue: [] as RevenueChartPoint[],
  chartBookings: [] as BookingsChartPoint[],
  chartDistribution: {
    byService: [] as DistributionByService[],
    byBarber: [] as DistributionByBarber[],
  },
}
