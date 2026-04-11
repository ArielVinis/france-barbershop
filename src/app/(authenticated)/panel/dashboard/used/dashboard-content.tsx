import Link from "next/link"
import { Suspense } from "react"
import { SectionCards } from "./dashboard-content/section-cards"
import { DashboardFilters } from "./dashboard-filters"
import { ChartRevenue } from "./dashboard-content/chart-revenue"
import { ChartBookings } from "./dashboard-content/chart-bookings"
import { ChartDistribution } from "./dashboard-content/chart-distribution"
import { PATHS } from "@/src/constants/PATHS"
import { Button } from "@/src/components/ui/button"

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

type DashboardContentProps = {
  barbershops: { id: string; name: string }[]
  stats: DashboardStats
  periodLabel: string
  chartRevenue: ChartRevenueData
  chartBookings: ChartBookingsData
  chartDistribution: ChartDistributionData
}

export function DashboardContent({
  barbershops,
  stats,
  periodLabel,
  chartRevenue,
  chartBookings,
  chartDistribution,
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
        <Link href={PATHS.PANEL.SCHEDULE}>
          <Button variant="outline">
            Ver agendamentos (calendário e tabela)
          </Button>
        </Link>
      </div>
    </>
  )
}
