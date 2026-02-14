"use client"

import { DollarSign, Calendar, Users, Scissors } from "lucide-react"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

export type DashboardStats = {
  revenue: number
  revenueBreakdown?: { barbershopName: string; revenue: number }[]
  bookingsCount: number
  activeBarbersCount: number
  topServices: { serviceName: string; count: number }[]
}

type SectionCardsProps = {
  stats: DashboardStats
  periodLabel?: string
}

export function SectionCards({ stats, periodLabel }: SectionCardsProps) {
  const periodText = periodLabel ?? "no período"

  return (
    <div className="*:data-[slot=card]:shadow-xs grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card sm:grid-cols-2 lg:px-6 xl:grid-cols-4">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Faturamento</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(stats.revenue)}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <DollarSign className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="text-muted-foreground">
            Apenas pagamentos confirmados (PAID) {periodText}
          </div>
          {stats.revenueBreakdown && stats.revenueBreakdown.length > 0 && (
            <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
              {stats.revenueBreakdown.map((b) => (
                <li key={b.barbershopName}>
                  {b.barbershopName}:{" "}
                  {Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(b.revenue)}
                </li>
              ))}
            </ul>
          )}
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Agendamentos</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.bookingsCount}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Calendar className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="text-muted-foreground">
            Total de reservas {periodText}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Barbeiros ativos</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.activeBarbersCount}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Users className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="text-muted-foreground">
            Cadastrados na(s) barbearia(s)
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Serviços mais vendidos</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            Top 5
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Scissors className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          {stats.topServices.length > 0 ? (
            <ul className="space-y-0.5 text-muted-foreground">
              {stats.topServices.map((s, i) => (
                <li key={s.serviceName}>
                  {i + 1}. {s.serviceName} — {s.count} reserva(s)
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground">
              Nenhum agendamento no período
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
