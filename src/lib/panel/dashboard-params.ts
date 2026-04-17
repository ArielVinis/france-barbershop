import { redirect } from "next/navigation"
import type { OwnerBookingsPeriod } from "@/src/features/owner/_data/get-owner-bookings"
import { PATHS } from "@/src/constants/PATHS"
import { SHOP_QUERY_PARAM } from "@/src/lib/panel/shop-query"

export const PANEL_DASHBOARD_PERIOD_LABELS: Record<
  OwnerBookingsPeriod,
  string
> = {
  day: "hoje",
  week: "esta semana",
  month: "este mês",
}

export function normalizePanelDashboardPeriod(
  value: string | undefined,
): OwnerBookingsPeriod {
  if (value === "day" || value === "week" || value === "month") return value
  return "week"
}

export function redirectBarberCanonicalDashboard(
  period: OwnerBookingsPeriod,
  barbershopId: string,
) {
  const q = new URLSearchParams()
  q.set("period", period)
  q.set(SHOP_QUERY_PARAM, barbershopId)
  redirect(`${PATHS.PANEL.ROOT}?${q.toString()}`)
}
