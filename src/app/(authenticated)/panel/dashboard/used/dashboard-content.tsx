import Link from "next/link"
import { Suspense } from "react"
import { SectionCards } from "./dashboard-content/section-cards"
import { DashboardFilters } from "./dashboard-filters"
import { ChartRevenue } from "./dashboard-content/chart-revenue"
import { ChartBookings } from "./dashboard-content/chart-bookings"
import { ChartDistribution } from "./dashboard-content/chart-distribution"
import { PATHS } from "@/src/constants/PATHS"
import { Button } from "@/src/components/ui/button"
import type {
  PanelDashboardBookingsSeries,
  PanelDashboardDistribution,
  PanelDashboardRevenueSeries,
  PanelDashboardStats,
} from "@/src/types/panel-dashboard"

type DashboardContentProps = {
  stats: PanelDashboardStats
  periodLabel: string
  chartRevenue: PanelDashboardRevenueSeries
  chartBookings: PanelDashboardBookingsSeries
  chartDistribution: PanelDashboardDistribution
  viewerRole?: "OWNER" | "BARBER"
}

export function DashboardContent({
  stats,
  periodLabel,
  chartRevenue,
  chartBookings,
  chartDistribution,
  viewerRole = "OWNER",
}: DashboardContentProps) {
  return (
    <>
      <Suspense fallback={<div className="h-10 px-4 lg:px-6" />}>
        <DashboardFilters />
      </Suspense>
      <SectionCards
        stats={stats}
        periodLabel={periodLabel}
        viewerRole={viewerRole}
      />
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
