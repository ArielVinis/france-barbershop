import { redirect } from "next/navigation"
import { getBarberForUser } from "@/src/lib/authz"
import { getBarberDashboardStats } from "@/src/features/barber/_data/get-barber-dashboard-stats"
import {
  getBarberChartDataBookings,
  getBarberChartDataDistribution,
  getBarberChartDataRevenue,
} from "@/src/features/barber/_data/get-barber-chart-data"
import { hasBarbershopSubscriptionAccess } from "@/src/features/owner/_data/get-barbershop-subscription-access"
import { DashboardContent } from "@/src/app/(authenticated)/panel/dashboard/used/dashboard-content"
import { PATHS } from "@/src/constants/PATHS"
import {
  normalizePanelDashboardPeriod,
  PANEL_DASHBOARD_PERIOD_LABELS,
  redirectBarberCanonicalDashboard,
} from "@/src/lib/panel/dashboard-params"

type Props = {
  userId: string
  searchParams: { period?: string; shopId?: string }
}

export async function PanelDashboardBarberSection({
  userId,
  searchParams,
}: Props) {
  const barber = await getBarberForUser(userId)
  if (!barber) return null

  const period = normalizePanelDashboardPeriod(searchParams.period)
  const shopParam = searchParams.shopId?.trim()
  if (!shopParam || shopParam === "all" || shopParam !== barber.barbershopId) {
    redirectBarberCanonicalDashboard(period, barber.barbershopId)
  }

  const hasSubscriptionAccess = await hasBarbershopSubscriptionAccess(
    barber.barbershopId,
  )
  if (!hasSubscriptionAccess) {
    redirect(PATHS.PANEL.SUBSCRIPTION)
  }

  const scope = {
    barbershopId: barber.barbershopId,
    barberId: barber.id,
  }
  const date = new Date()

  const [stats, chartRevenue, chartBookings, chartDistribution] =
    await Promise.all([
      getBarberDashboardStats(scope, { period, date }),
      getBarberChartDataRevenue(scope, { period, date }),
      getBarberChartDataBookings(scope, { period, date }),
      getBarberChartDataDistribution(scope, { period, date }),
    ])

  const dashboardStats = {
    revenue: stats.revenue,
    revenueBreakdown: stats.revenueBreakdown.map((b) => ({
      barbershopName: b.barbershopName,
      revenue: b.revenue,
    })),
    bookingsCount: stats.bookingsCount,
    activeBarbersCount: stats.activeBarbersCount,
    topServices: stats.topServices.map((s) => ({
      serviceName: s.serviceName,
      count: s.count,
    })),
  }

  const periodLabel = PANEL_DASHBOARD_PERIOD_LABELS[period]
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DashboardContent
            viewerRole="BARBER"
            stats={dashboardStats}
            periodLabel={periodLabel}
            chartRevenue={chartRevenue}
            chartBookings={chartBookings}
            chartDistribution={chartDistribution}
          />
        </div>
      </div>
    </div>
  )
}
