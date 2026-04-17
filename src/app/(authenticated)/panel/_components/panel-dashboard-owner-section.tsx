import Link from "next/link"
import { redirect } from "next/navigation"
import { getOwnerByUserId } from "@/src/features/owner/_data/get-owner-by-user-id"
import { getOwnerDashboardStats } from "@/src/features/owner/_data/get-owner-dashboard-stats"
import {
  getOwnerChartDataBookings,
  getOwnerChartDataDistribution,
  getOwnerChartDataRevenue,
} from "@/src/features/owner/_data/get-owner-chart-data"
import { hasOwnerSubscriptionAccess } from "@/src/features/owner/_data/get-owner-subscription-access"
import { DashboardContent } from "@/src/app/(authenticated)/panel/dashboard/used/dashboard-content"
import { PATHS } from "@/src/constants/PATHS"
import {
  normalizePanelDashboardPeriod,
  PANEL_DASHBOARD_PERIOD_LABELS,
} from "@/src/lib/panel/dashboard-params"
import { resolveShopIdForAggregate } from "@/src/lib/panel/shop-query"

type Props = {
  userId: string
  searchParams: { period?: string; shopId?: string }
}

export async function PanelDashboardOwnerSection({
  userId,
  searchParams,
}: Props) {
  const owner = await getOwnerByUserId(userId)
  if (!owner) return null

  const hasSubscriptionAccess = await hasOwnerSubscriptionAccess(
    owner.user.email,
  )
  if (!hasSubscriptionAccess) {
    redirect(PATHS.PANEL.SUBSCRIPTION)
  }

  if (owner.barbershops.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="max-w-md rounded-lg border bg-card p-6 text-center">
          <h2 className="text-lg font-semibold">Nenhuma barbearia vinculada</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu usuário ainda não está vinculado a nenhuma barbearia. Peça ao
            administrador para associar sua conta (PANEL) a uma barbearia para
            acessar o painel.
          </p>
          {process.env.NODE_ENV === "development" && (
            <Link
              href={PATHS.PANEL.ROOT}
              className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4"
            >
              Dev: Vincular barbearia pela interface →
            </Link>
          )}
        </div>
      </div>
    )
  }

  const period = normalizePanelDashboardPeriod(searchParams.period)
  const barbershopIds = owner.barbershops.map((b) => b.id)
  const shopResolved = resolveShopIdForAggregate(
    searchParams.shopId,
    barbershopIds,
  )
  const barbershopId =
    shopResolved === "all" || shopResolved === null ? null : shopResolved
  const date = new Date()

  const [stats, chartRevenue, chartBookings, chartDistribution] =
    await Promise.all([
      getOwnerDashboardStats(barbershopIds, { period, barbershopId, date }),
      getOwnerChartDataRevenue(barbershopIds, { period, barbershopId, date }),
      getOwnerChartDataBookings(barbershopIds, { period, barbershopId, date }),
      getOwnerChartDataDistribution(barbershopIds, {
        period,
        barbershopId,
        date,
      }),
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
            viewerRole="OWNER"
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
