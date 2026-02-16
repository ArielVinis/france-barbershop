import Link from "next/link"
import { Suspense } from "react"
import { getSession } from "@/src/lib/auth"
import { getOwnerByUserId } from "@/src/features/owner/_data/get-owner-by-user-id"
import { getOwnerDashboardStats } from "@/src/features/owner/_data/get-owner-dashboard-stats"
import { getOwnerBookings } from "@/src/features/owner/_data/get-owner-bookings"
import {
  getOwnerChartDataRevenue,
  getOwnerChartDataBookings,
  getOwnerChartDataDistribution,
} from "@/src/features/owner/_data/get-owner-chart-data"
import type { OwnerBookingsPeriod } from "@/src/features/owner/_data/get-owner-bookings"
import { AppSidebar } from "@/src/components/owner/app-sidebar"
import { SectionCards } from "@/src/components/owner/section-cards"
import { DashboardFilters } from "@/src/components/owner/dashboard-filters"
import { ChartRevenue } from "@/src/components/owner/chart-revenue"
import { ChartBookings } from "@/src/components/owner/chart-bookings"
import { ChartDistribution } from "@/src/components/owner/chart-distribution"
import { OwnerBookingsTable } from "@/src/components/owner/owner-bookings-table"
import { SiteHeader } from "@/src/components/owner/site-header"
import { SidebarInset, SidebarProvider } from "@/src/components/ui/sidebar"

const PERIOD_LABELS: Record<OwnerBookingsPeriod, string> = {
  day: "hoje",
  week: "esta semana",
  month: "este mês",
}

export default async function OwnerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; barbershop?: string }>
}) {
  const user = await getSession()
  const owner = await getOwnerByUserId(user.id)
  if (!owner) {
    return null
  }

  if (owner.barbershops.length === 0) {
    return (
      <SidebarProvider className="h-full !min-h-0">
        <AppSidebar
          className="h-full !min-h-0"
          variant="inset"
          user={owner.user}
          barbershops={owner.barbershops}
        />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <div className="max-w-md rounded-lg border bg-card p-6 text-center">
              <h2 className="text-lg font-semibold">
                Nenhuma barbearia vinculada
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Seu usuário ainda não está vinculado a nenhuma barbearia. Peça
                ao administrador para associar sua conta (OWNER) a uma barbearia
                para acessar o painel.
              </p>
              {process.env.NODE_ENV === "development" && (
                <Link
                  href="/dev/owner"
                  className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4"
                >
                  Dev: Vincular barbearia pela interface →
                </Link>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const params = await searchParams
  const period =
    params.period === "day" ||
    params.period === "week" ||
    params.period === "month"
      ? params.period
      : "week"
  const barbershopId =
    params.barbershop &&
    owner.barbershops.some((b) => b.id === params.barbershop)
      ? params.barbershop
      : null

  const barbershopIds = owner.barbershops.map((b) => b.id)
  const date = new Date()

  const [stats, bookings, chartRevenue, chartBookings, chartDistribution] =
    await Promise.all([
      getOwnerDashboardStats(barbershopIds, { period, barbershopId, date }),
      getOwnerBookings(barbershopIds, { period, barbershopId, date }),
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

  const periodLabel = PERIOD_LABELS[period]

  return (
    <SidebarProvider className="h-full !min-h-0">
      <AppSidebar
        variant="inset"
        user={owner.user}
        barbershops={owner.barbershops}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Suspense fallback={<div className="h-10 px-4 lg:px-6" />}>
                <DashboardFilters
                  barbershops={owner.barbershops.map((b) => ({
                    id: b.id,
                    name: b.name,
                  }))}
                />
              </Suspense>
              <SectionCards stats={dashboardStats} periodLabel={periodLabel} />
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
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
