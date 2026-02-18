import { Suspense } from "react"
import { SectionCards } from "./dashboard-content/section-cards"
import { DashboardFilters } from "./dashboard-filters"
import { ChartRevenue } from "./dashboard-content/chart-revenue"
import { ChartBookings } from "./dashboard-content/chart-bookings"
import { ChartDistribution } from "./dashboard-content/chart-distribution"
import { OwnerBookingsTable } from "./dashboard-content/owner-bookings-table"

type DashboardStats = {
  revenue: number
  revenueBreakdown: { barbershopName: string; revenue: number }[]
  bookingsCount: number
  activeBarbersCount: number
  topServices: { serviceName: string; count: number }[]
}

type ChartRevenueData = Awaited<
  ReturnType<
    typeof import("@/src/features/owner/_data/get-owner-chart-data").getOwnerChartDataRevenue
  >
>
type ChartBookingsData = Awaited<
  ReturnType<
    typeof import("@/src/features/owner/_data/get-owner-chart-data").getOwnerChartDataBookings
  >
>
type ChartDistributionData = Awaited<
  ReturnType<
    typeof import("@/src/features/owner/_data/get-owner-chart-data").getOwnerChartDataDistribution
  >
>
type BookingsData = Awaited<
  ReturnType<
    typeof import("@/src/features/owner/_data/get-owner-bookings").getOwnerBookings
  >
>

type DashboardContentProps = {
  barbershops: { id: string; name: string }[]
  stats: DashboardStats
  periodLabel: string
  chartRevenue: ChartRevenueData
  chartBookings: ChartBookingsData
  chartDistribution: ChartDistributionData
  bookings: BookingsData
}

export function DashboardContent({
  barbershops,
  stats,
  periodLabel,
  chartRevenue,
  chartBookings,
  chartDistribution,
  bookings,
}: DashboardContentProps) {
  return (
    <>
      <Suspense fallback={<div className="h-10 px-4 lg:px-6" />}>
        <DashboardFilters barbershops={barbershops} />
      </Suspense>
      <SectionCards stats={stats} periodLabel={periodLabel} />
      <div className="grid gap-4 px-4 lg:grid-cols-2 lg:px-6">
        <ChartRevenue data={chartRevenue} periodLabel={periodLabel} />
        <ChartBookings data={chartBookings} periodLabel={periodLabel} />
      </div>
      <div className="px-4 lg:px-6">
        <ChartDistribution
          byService={chartDistribution.byService}
          byBarber={chartDistribution.byBarber}
          periodLabel={periodLabel}
        />
      </div>
      <div className="px-4 lg:px-6">
        <h2 className="mb-3 text-lg font-semibold">Agendamentos</h2>
        <OwnerBookingsTable bookings={bookings} />
      </div>
    </>
  )
}
