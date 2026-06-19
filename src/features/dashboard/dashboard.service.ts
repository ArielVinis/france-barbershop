import { dashboardRepository } from "@/src/features/dashboard/dashboard.repository"
import type {
  BookingsChartPoint,
  DistributionByBarber,
  DistributionByService,
  OwnerChartPeriod,
  OwnerDashboardStats,
  OwnerStatsPeriod,
  RevenueChartPoint,
} from "@/src/features/dashboard/dashboard.types"
import { resolveOwnerOrganizationIdsForQueries } from "@/src/shared/guards/panel/resolve-owner-organization-ids"
import type { OwnerOrganizationIdList } from "@/src/shared/types/panel-data-scope"

function buildTopServices(
  servicesAgg: { serviceId: string; _count: { id: number } }[],
) {
  const serviceIds = servicesAgg.map((s) => s.serviceId)
  return dashboardRepository.findServicesByIds(serviceIds).then((services) => {
    const serviceNames = new Map(services.map((s) => [s.id, s.name]))
    return servicesAgg
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 5)
      .map((s) => ({
        serviceId: s.serviceId,
        serviceName: serviceNames.get(s.serviceId) ?? "—",
        count: s._count.id,
      }))
  })
}

export const dashboardService = {
  async getOwnerDashboardStats(
    organizationIds: OwnerOrganizationIdList,
    options: {
      organizationId?: string | null
      period: OwnerStatsPeriod
      date: Date
    },
  ): Promise<OwnerDashboardStats> {
    const { period, date, organizationId } = options
    const shopIds = resolveOwnerOrganizationIdsForQueries(
      organizationIds,
      organizationId,
    )
    if (shopIds.length === 0) {
      return {
        revenue: 0,
        revenueBreakdown: [],
        bookingsCount: 0,
        activeBarbersCount: 0,
        topServices: [],
      }
    }

    const { start, end } = dashboardRepository.periodBounds(period, date)

    const [paidBookings, allBookingsForCount, barbersCount, servicesAgg] =
      await Promise.all([
        dashboardRepository.findPaidBookingsForShops(shopIds, start, end),
        dashboardRepository.findBookingsForShops(shopIds, start, end),
        dashboardRepository.countActiveBarbers(shopIds),
        dashboardRepository.groupBookingsByService(shopIds, start, end),
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
      const id = b.service.organizationId
      const name = b.service.organization.name
      const prev = revenueByShop.get(id)
      const add = Number(b.service.price)
      revenueByShop.set(id, {
        barbershopName: name,
        revenue: (prev?.revenue ?? 0) + add,
      })
    }
    const revenueBreakdown = Array.from(revenueByShop.entries()).map(
      ([organizationId, v]) => ({
        organizationId,
        barbershopName: v.barbershopName,
        revenue: v.revenue,
      }),
    )

    const topServices = await buildTopServices(servicesAgg)

    return {
      revenue,
      revenueBreakdown,
      bookingsCount: allBookingsForCount.length,
      activeBarbersCount: barbersCount,
      topServices,
    }
  },

  async getBarberDashboardStats(
    scope: { organizationId: string; memberId: string },
    options: { period: OwnerStatsPeriod; date: Date },
  ): Promise<OwnerDashboardStats> {
    const { organizationId, memberId } = scope
    const { period, date } = options
    const { start, end } = dashboardRepository.periodBounds(period, date)

    const [paidBookings, allBookingsForCount, shopNameRow, servicesAgg] =
      await Promise.all([
        dashboardRepository.findBarberPaidBookings(
          organizationId,
          memberId,
          start,
          end,
        ),
        dashboardRepository.findBarberBookings(
          organizationId,
          memberId,
          start,
          end,
        ),
        dashboardRepository.findOrganizationName(organizationId),
        dashboardRepository.groupBarberBookingsByService(
          organizationId,
          memberId,
          start,
          end,
        ),
      ])

    const revenue = paidBookings.reduce(
      (sum, b) => sum + Number(b.service.price),
      0,
    )

    const shopName = shopNameRow?.name ?? "Barbearia"
    const revenueBreakdown = [
      {
        organizationId,
        barbershopName: shopName,
        revenue,
      },
    ]

    const topServices = await buildTopServices(servicesAgg)

    return {
      revenue,
      revenueBreakdown,
      bookingsCount: allBookingsForCount.length,
      activeBarbersCount: 1,
      topServices,
    }
  },

  async getOwnerChartDataRevenue(
    organizationIds: OwnerOrganizationIdList,
    options: {
      organizationId?: string | null
      period: OwnerChartPeriod
      date: Date
    },
  ): Promise<RevenueChartPoint[]> {
    const { period, date, organizationId } = options
    const shopIds = resolveOwnerOrganizationIdsForQueries(
      organizationIds,
      organizationId,
    )
    if (shopIds.length === 0) return []

    const { start, end } = dashboardRepository.periodBounds(period, date)
    const days = dashboardRepository.eachDayOfInterval({ start, end })
    const bookings = await dashboardRepository.findPaidBookingsForShops(
      shopIds,
      start,
      end,
    )

    const byDay = new Map<string, number>()
    for (const d of days) {
      byDay.set(dashboardRepository.format(d, "yyyy-MM-dd"), 0)
    }
    for (const b of bookings) {
      const key = dashboardRepository.format(b.date, "yyyy-MM-dd")
      const current = byDay.get(key) ?? 0
      byDay.set(key, current + Number(b.service.price))
    }

    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue }))
  },

  async getOwnerChartDataBookings(
    organizationIds: OwnerOrganizationIdList,
    options: {
      organizationId?: string | null
      period: OwnerChartPeriod
      date: Date
    },
  ): Promise<BookingsChartPoint[]> {
    const { period, date, organizationId } = options
    const shopIds = resolveOwnerOrganizationIdsForQueries(
      organizationIds,
      organizationId,
    )
    if (shopIds.length === 0) return []

    const { start, end } = dashboardRepository.periodBounds(period, date)
    const bookings = await dashboardRepository.findBookingsForShops(
      shopIds,
      start,
      end,
    )

    const byDay = new Map<string, number>()
    for (const b of bookings) {
      const key = dashboardRepository.format(b.date, "yyyy-MM-dd")
      byDay.set(key, (byDay.get(key) ?? 0) + 1)
    }

    const days = dashboardRepository.eachDayOfInterval({ start, end })
    return days.map((d) => {
      const key = dashboardRepository.format(d, "yyyy-MM-dd")
      return { date: key, count: byDay.get(key) ?? 0 }
    })
  },

  async getOwnerChartDataDistribution(
    organizationIds: OwnerOrganizationIdList,
    options: {
      organizationId?: string | null
      period: OwnerChartPeriod
      date: Date
    },
  ): Promise<{
    byService: DistributionByService[]
    byBarber: DistributionByBarber[]
  }> {
    const { period, date, organizationId } = options
    const shopIds = resolveOwnerOrganizationIdsForQueries(
      organizationIds,
      organizationId,
    )
    if (shopIds.length === 0) {
      return { byService: [], byBarber: [] }
    }

    const { start, end } = dashboardRepository.periodBounds(period, date)

    const [byServiceAgg, byMemberAgg] = await Promise.all([
      dashboardRepository.groupBookingsByService(shopIds, start, end),
      dashboardRepository.groupBookingsByMember(shopIds, start, end),
    ])

    const serviceIds = byServiceAgg.map((s) => s.serviceId).filter(Boolean)
    const memberIds = byMemberAgg
      .map((b) => b.memberId)
      .filter(Boolean) as string[]

    const [services, members] = await Promise.all([
      serviceIds.length > 0
        ? dashboardRepository.findServicesByIds(serviceIds)
        : [],
      memberIds.length > 0
        ? dashboardRepository.findMembersByIds(memberIds)
        : [],
    ])

    const serviceNames = new Map(services.map((s) => [s.id, s.name]))
    const memberNames = new Map(
      members.map((m) => [m.id, m.user?.name ?? "—"]),
    )

    const byService = byServiceAgg
      .map((s) => ({
        name: serviceNames.get(s.serviceId) ?? "—",
        count: s._count.id,
      }))
      .sort((a, b) => b.count - a.count)

    const byBarber = byMemberAgg
      .map((b) => ({
        name: memberNames.get(b.memberId!) ?? "—",
        count: b._count.id,
      }))
      .sort((a, b) => b.count - a.count)

    return { byService, byBarber }
  },

  async getBarberChartDataRevenue(
    scope: { organizationId: string; memberId: string },
    options: { period: OwnerChartPeriod; date: Date },
  ): Promise<RevenueChartPoint[]> {
    const { organizationId, memberId } = scope
    const { period, date } = options
    const { start, end } = dashboardRepository.periodBounds(period, date)

    const days = dashboardRepository.eachDayOfInterval({ start, end })
    const bookings = await dashboardRepository.findBarberPaidBookings(
      organizationId,
      memberId,
      start,
      end,
    )

    const byDay = new Map<string, number>()
    for (const d of days) {
      byDay.set(dashboardRepository.format(d, "yyyy-MM-dd"), 0)
    }
    for (const b of bookings) {
      const key = dashboardRepository.format(b.date, "yyyy-MM-dd")
      const current = byDay.get(key) ?? 0
      byDay.set(key, current + Number(b.service.price))
    }

    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue }))
  },

  async getBarberChartDataBookings(
    scope: { organizationId: string; memberId: string },
    options: { period: OwnerChartPeriod; date: Date },
  ): Promise<BookingsChartPoint[]> {
    const { organizationId, memberId } = scope
    const { period, date } = options
    const { start, end } = dashboardRepository.periodBounds(period, date)

    const bookings = await dashboardRepository.findBarberBookings(
      organizationId,
      memberId,
      start,
      end,
    )

    const byDay = new Map<string, number>()
    for (const b of bookings) {
      const key = dashboardRepository.format(b.date, "yyyy-MM-dd")
      byDay.set(key, (byDay.get(key) ?? 0) + 1)
    }

    const days = dashboardRepository.eachDayOfInterval({ start, end })
    return days.map((d) => {
      const key = dashboardRepository.format(d, "yyyy-MM-dd")
      return { date: key, count: byDay.get(key) ?? 0 }
    })
  },

  async getBarberChartDataDistribution(
    scope: { organizationId: string; memberId: string },
    options: { period: OwnerChartPeriod; date: Date },
  ): Promise<{
    byService: DistributionByService[]
    byBarber: DistributionByBarber[]
  }> {
    const { organizationId, memberId } = scope
    const { period, date } = options
    const { start, end } = dashboardRepository.periodBounds(period, date)

    const [byServiceAgg, selfName] = await Promise.all([
      dashboardRepository.groupBarberBookingsByService(
        organizationId,
        memberId,
        start,
        end,
      ),
      dashboardRepository.findMemberName(memberId),
    ])

    const serviceIds = byServiceAgg.map((s) => s.serviceId).filter(Boolean)
    const services =
      serviceIds.length > 0
        ? await dashboardRepository.findServicesByIds(serviceIds)
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
  },
}

export const getOwnerDashboardStats = dashboardService.getOwnerDashboardStats.bind(
  dashboardService,
)
export const getBarberDashboardStats =
  dashboardService.getBarberDashboardStats.bind(dashboardService)
export const getOwnerChartDataRevenue =
  dashboardService.getOwnerChartDataRevenue.bind(dashboardService)
export const getOwnerChartDataBookings =
  dashboardService.getOwnerChartDataBookings.bind(dashboardService)
export const getOwnerChartDataDistribution =
  dashboardService.getOwnerChartDataDistribution.bind(dashboardService)
export const getBarberChartDataRevenue =
  dashboardService.getBarberChartDataRevenue.bind(dashboardService)
export const getBarberChartDataBookings =
  dashboardService.getBarberChartDataBookings.bind(dashboardService)
export const getBarberChartDataDistribution =
  dashboardService.getBarberChartDataDistribution.bind(dashboardService)
