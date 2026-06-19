import type { PanelPeriod } from "@/src/shared/types/panel-data-scope"

export const PANEL_DASHBOARD_PERIOD_LABELS: Record<PanelPeriod, string> = {
  day: "hoje",
  week: "esta semana",
  month: "este mês",
}

export function normalizePanelDashboardPeriod(
  value: string | undefined,
): PanelPeriod {
  if (value === "day" || value === "week" || value === "month") return value
  return "week"
}
