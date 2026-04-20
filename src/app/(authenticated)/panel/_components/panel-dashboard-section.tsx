import Link from "next/link"
import { redirect } from "next/navigation"
import { getBarberDashboardStats } from "@/src/features/barber/_data/get-barber-dashboard-stats"
import {
  getBarberChartDataBookings,
  getBarberChartDataDistribution,
  getBarberChartDataRevenue,
} from "@/src/features/barber/_data/get-barber-chart-data"
import { getOwnerByUserId } from "@/src/features/owner/_data/get-owner-by-user-id"
import {
  getOwnerChartDataBookings,
  getOwnerChartDataDistribution,
  getOwnerChartDataRevenue,
} from "@/src/features/owner/_data/get-owner-chart-data"
import { getOwnerDashboardStats } from "@/src/features/owner/_data/get-owner-dashboard-stats"
import { hasBarbershopSubscriptionAccess } from "@/src/features/owner/_data/get-barbershop-subscription-access"
import { hasOwnerSubscriptionAccess } from "@/src/features/owner/_data/get-owner-subscription-access"
import { DashboardContent } from "@/src/app/(authenticated)/panel/dashboard/used/dashboard-content"
import { PATHS } from "@/src/constants/PATHS"
import { getBarberForUser } from "@/src/lib/authz"
import type { AuthUser } from "@/src/lib/auth"
import { ensureBarberShopIdMatchesUrl } from "@/src/lib/panel/ensure-barber-shop-query"
import {
  normalizePanelDashboardPeriod,
  PANEL_DASHBOARD_PERIOD_LABELS,
} from "@/src/lib/panel/dashboard-params"
import { resolveShopIdForAggregate } from "@/src/lib/panel/shop-query"
import type { PanelDashboardStats } from "@/src/types/panel-dashboard"

type Props = {
  user: AuthUser
  searchParams: { period?: string; shopId?: string }
}

function mapDashboardStats(stats: {
  revenue: number
  revenueBreakdown: { barbershopName: string; revenue: number }[]
  bookingsCount: number
  activeBarbersCount: number
  topServices: { serviceName: string; count: number }[]
}): PanelDashboardStats {
  return {
    revenue: stats.revenue,
    revenueBreakdown: stats.revenueBreakdown.map((item) => ({
      barbershopName: item.barbershopName,
      revenue: item.revenue,
    })),
    bookingsCount: stats.bookingsCount,
    activeBarbersCount: stats.activeBarbersCount,
    topServices: stats.topServices.map((item) => ({
      serviceName: item.serviceName,
      count: item.count,
    })),
  }
}

function renderOwnerWithoutShops() {
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

export async function PanelDashboardSection({ user, searchParams }: Props) {
  const period = normalizePanelDashboardPeriod(searchParams.period)
  const periodLabel = PANEL_DASHBOARD_PERIOD_LABELS[period]
  const date = new Date()

  if (user.role === "OWNER") {
    const owner = await getOwnerByUserId(user.id)
    if (!owner) return null

    const hasSubscriptionAccess = await hasOwnerSubscriptionAccess(
      owner.user.email,
    )
    if (!hasSubscriptionAccess) {
      redirect(PATHS.PANEL.SUBSCRIPTION)
    }

    if (owner.barbershops.length === 0) {
      return renderOwnerWithoutShops()
    }

    const barbershopIds = owner.barbershops.map((barbershop) => barbershop.id)
    const shopResolved = resolveShopIdForAggregate(
      searchParams.shopId,
      barbershopIds,
    )
    const barbershopId =
      shopResolved === "all" || shopResolved === null ? null : shopResolved

    const [stats, chartRevenue, chartBookings, chartDistribution] =
      await Promise.all([
        getOwnerDashboardStats(barbershopIds, { period, barbershopId, date }),
        getOwnerChartDataRevenue(barbershopIds, { period, barbershopId, date }),
        getOwnerChartDataBookings(barbershopIds, {
          period,
          barbershopId,
          date,
        }),
        getOwnerChartDataDistribution(barbershopIds, {
          period,
          barbershopId,
          date,
        }),
      ])

    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <DashboardContent
              viewerRole="OWNER"
              stats={mapDashboardStats(stats)}
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

  if (user.role === "BARBER") {
    const barber = await getBarberForUser(user.id)
    if (!barber) return null

    ensureBarberShopIdMatchesUrl(
      PATHS.PANEL.ROOT,
      {
        period,
        shopId: searchParams.shopId,
      },
      barber.barbershopId,
    )

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

    const [stats, chartRevenue, chartBookings, chartDistribution] =
      await Promise.all([
        getBarberDashboardStats(scope, { period, date }),
        getBarberChartDataRevenue(scope, { period, date }),
        getBarberChartDataBookings(scope, { period, date }),
        getBarberChartDataDistribution(scope, { period, date }),
      ])

    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <DashboardContent
              viewerRole="BARBER"
              stats={mapDashboardStats(stats)}
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

  return null
}
