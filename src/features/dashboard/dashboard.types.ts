import type { PanelPeriod } from "@/src/shared/types/panel-data-scope"

export type OwnerStatsPeriod = PanelPeriod
export type OwnerChartPeriod = PanelPeriod

export type OwnerDashboardStats = {
  revenue: number
  revenueBreakdown: {
    organizationId: string
    barbershopName: string
    revenue: number
  }[]
  bookingsCount: number
  activeBarbersCount: number
  topServices: { serviceId: string; serviceName: string; count: number }[]
}

export type RevenueChartPoint = { date: string; revenue: number }
export type BookingsChartPoint = { date: string; count: number }
export type DistributionByService = { name: string; count: number }
export type DistributionByBarber = { name: string; count: number }

export type OwnerDashboardBundle = {
  stats: OwnerDashboardStats
  chartRevenue: RevenueChartPoint[]
  chartBookings: BookingsChartPoint[]
  chartDistribution: {
    byService: DistributionByService[]
    byBarber: DistributionByBarber[]
  }
}
