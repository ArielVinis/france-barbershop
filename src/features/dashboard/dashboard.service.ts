import {
  buildBookingsChart,
  buildDistributionByBarber,
  buildDistributionByService,
  buildOwnerStats,
  buildRevenueChart,
  buildTopServices,
  EMPTY_OWNER_DASHBOARD_BUNDLE,
} from "@/src/features/dashboard/_lib/dashboard-aggregates"
import { dashboardRepository } from "@/src/features/dashboard/dashboard.repository"
import type {
  BookingsChartPoint,
  DistributionByBarber,
  DistributionByService,
  OwnerChartPeriod,
  OwnerDashboardBundle,
  OwnerDashboardStats,
  OwnerStatsPeriod,
  RevenueChartPoint,
} from "@/src/features/dashboard/dashboard.types"
import { resolveOwnerOrganizationIdsForQueries } from "@/src/shared/guards/panel/resolve-owner-organization-ids"
import type { OwnerOrganizationIdList } from "@/src/shared/types/panel-data-scope"

async function resolveServiceNames(serviceIds: string[]) {
  if (serviceIds.length === 0) return new Map<string, string>()
  const services = await dashboardRepository.findServicesByIds(serviceIds)
  return new Map(services.map((s) => [s.id, s.name]))
}

async function resolveMemberNames(memberIds: string[]) {
  if (memberIds.length === 0) return new Map<string, string>()
  const members = await dashboardRepository.findMembersByIds(memberIds)
  return new Map(members.map((m) => [m.id, m.user?.name ?? "—"]))
}

export const dashboardService = {
  async getOwnerDashboardBundle(
    organizationIds: OwnerOrganizationIdList,
    options: {
      organizationId?: string | null
      period: OwnerStatsPeriod
      date: Date
    },
  ): Promise<OwnerDashboardBundle> {
    const { period, date, organizationId } = options
    const shopIds = resolveOwnerOrganizationIdsForQueries(
      organizationIds,
      organizationId,
    )
    if (shopIds.length === 0) {
      return EMPTY_OWNER_DASHBOARD_BUNDLE
    }

    const { start, end } = dashboardRepository.periodBounds(period, date)
    const days = dashboardRepository.eachDayOfInterval({ start, end })

    const [paidBookings, allBookings, barbersCount, servicesAgg, byMemberAgg] =
      await Promise.all([
        dashboardRepository.findPaidBookingsForShops(shopIds, start, end),
        dashboardRepository.findBookingsForShops(shopIds, start, end),
        dashboardRepository.countActiveBarbers(shopIds),
        dashboardRepository.groupBookingsByService(shopIds, start, end),
        dashboardRepository.groupBookingsByMember(shopIds, start, end),
      ])

    const serviceIds = servicesAgg.map((s) => s.serviceId).filter(Boolean)
    const memberIds = byMemberAgg
      .map((b) => b.memberId)
      .filter(Boolean) as string[]

    const [serviceNames, memberNames] = await Promise.all([
      resolveServiceNames(serviceIds),
      resolveMemberNames(memberIds),
    ])

    return {
      stats: buildOwnerStats({
        paidBookings,
        bookingsCount: allBookings.length,
        activeBarbersCount: barbersCount,
        servicesAgg,
        serviceNames,
      }),
      chartRevenue: buildRevenueChart(paidBookings, days),
      chartBookings: buildBookingsChart(allBookings, days),
      chartDistribution: {
        byService: buildDistributionByService(servicesAgg, serviceNames),
        byBarber: buildDistributionByBarber(byMemberAgg, memberNames),
      },
    }
  },

  async getBarberDashboardBundle(
    scope: { organizationId: string; memberId: string },
    options: { period: OwnerStatsPeriod; date: Date },
  ): Promise<OwnerDashboardBundle> {
    const { organizationId, memberId } = scope
    const { period, date } = options
    const { start, end } = dashboardRepository.periodBounds(period, date)
    const days = dashboardRepository.eachDayOfInterval({ start, end })

    const [paidBookings, allBookings, shopNameRow, servicesAgg, selfName] =
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
        dashboardRepository.findMemberName(memberId),
      ])

    const revenue = paidBookings.reduce(
      (sum, b) => sum + Number(b.service.price),
      0,
    )
    const shopName = shopNameRow?.name ?? "Barbearia"
    const serviceIds = servicesAgg.map((s) => s.serviceId).filter(Boolean)
    const serviceNames = await resolveServiceNames(serviceIds)

    const byService = buildDistributionByService(servicesAgg, serviceNames)
    const total = byService.reduce((a, s) => a + s.count, 0)
    const byBarber: DistributionByBarber[] =
      total > 0
        ? [{ name: selfName?.user?.name ?? "Você", count: total }]
        : []

    return {
      stats: {
        revenue,
        revenueBreakdown: [
          {
            organizationId,
            barbershopName: shopName,
            revenue,
          },
        ],
        bookingsCount: allBookings.length,
        activeBarbersCount: 1,
        topServices: buildTopServices(servicesAgg, serviceNames),
      },
      chartRevenue: buildRevenueChart(paidBookings, days),
      chartBookings: buildBookingsChart(allBookings, days),
      chartDistribution: { byService, byBarber },
    }
  },

  async getOwnerDashboardStats(
    organizationIds: OwnerOrganizationIdList,
    options: {
      organizationId?: string | null
      period: OwnerStatsPeriod
      date: Date
    },
  ): Promise<OwnerDashboardStats> {
    const bundle = await dashboardService.getOwnerDashboardBundle(
      organizationIds,
      options,
    )
    return bundle.stats
  },

  async getBarberDashboardStats(
    scope: { organizationId: string; memberId: string },
    options: { period: OwnerStatsPeriod; date: Date },
  ): Promise<OwnerDashboardStats> {
    const bundle = await dashboardService.getBarberDashboardBundle(
      scope,
      options,
    )
    return bundle.stats
  },

  async getOwnerChartDataRevenue(
    organizationIds: OwnerOrganizationIdList,
    options: {
      organizationId?: string | null
      period: OwnerChartPeriod
      date: Date
    },
  ): Promise<RevenueChartPoint[]> {
    const bundle = await dashboardService.getOwnerDashboardBundle(
      organizationIds,
      options,
    )
    return bundle.chartRevenue
  },

  async getOwnerChartDataBookings(
    organizationIds: OwnerOrganizationIdList,
    options: {
      organizationId?: string | null
      period: OwnerChartPeriod
      date: Date
    },
  ): Promise<BookingsChartPoint[]> {
    const bundle = await dashboardService.getOwnerDashboardBundle(
      organizationIds,
      options,
    )
    return bundle.chartBookings
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
    const bundle = await dashboardService.getOwnerDashboardBundle(
      organizationIds,
      options,
    )
    return bundle.chartDistribution
  },

  async getBarberChartDataRevenue(
    scope: { organizationId: string; memberId: string },
    options: { period: OwnerChartPeriod; date: Date },
  ): Promise<RevenueChartPoint[]> {
    const bundle = await dashboardService.getBarberDashboardBundle(
      scope,
      options,
    )
    return bundle.chartRevenue
  },

  async getBarberChartDataBookings(
    scope: { organizationId: string; memberId: string },
    options: { period: OwnerChartPeriod; date: Date },
  ): Promise<BookingsChartPoint[]> {
    const bundle = await dashboardService.getBarberDashboardBundle(
      scope,
      options,
    )
    return bundle.chartBookings
  },

  async getBarberChartDataDistribution(
    scope: { organizationId: string; memberId: string },
    options: { period: OwnerChartPeriod; date: Date },
  ): Promise<{
    byService: DistributionByService[]
    byBarber: DistributionByBarber[]
  }> {
    const bundle = await dashboardService.getBarberDashboardBundle(
      scope,
      options,
    )
    return bundle.chartDistribution
  },
}

export const getOwnerDashboardBundle =
  dashboardService.getOwnerDashboardBundle.bind(dashboardService)
export const getBarberDashboardBundle =
  dashboardService.getBarberDashboardBundle.bind(dashboardService)
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
