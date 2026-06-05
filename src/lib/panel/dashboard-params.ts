import type { OwnerBookingsPeriod } from "@/src/features/owner/_data/get-owner-bookings"

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
