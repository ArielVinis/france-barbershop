import type {
  BookingsChartPoint,
  DistributionByBarber,
  DistributionByService,
  RevenueChartPoint,
} from "@/src/features/owner/_data/get-owner-chart-data"

/**
 * Dados dos cartões do dashboard do painel (OWNER e BARBER usam a mesma forma).
 */
export type PanelDashboardStats = {
  revenue: number
  revenueBreakdown: { barbershopName: string; revenue: number }[]
  bookingsCount: number
  activeBarbersCount: number
  topServices: { serviceName: string; count: number }[]
}

/** Série temporal — faturamento (PAID). */
export type PanelDashboardRevenueSeries = RevenueChartPoint[]

/** Série temporal — contagem de agendamentos. */
export type PanelDashboardBookingsSeries = BookingsChartPoint[]

/** Distribuição por serviço e por barbeiro (mesma forma owner/barber). */
export type PanelDashboardDistribution = {
  byService: DistributionByService[]
  byBarber: DistributionByBarber[]
}
