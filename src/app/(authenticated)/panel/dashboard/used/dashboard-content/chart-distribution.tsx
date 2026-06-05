"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart"

export type DistributionItem = { name: string; count: number }

const serviceConfig = {
  name: { label: "Serviço" },
  count: {
    label: "Reservas",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

const barberConfig = {
  name: { label: "Barbeiro" },
  count: {
    label: "Reservas",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

type ChartDistributionProps = {
  byService: DistributionItem[]
  byBarber: DistributionItem[]
  periodLabel?: string
}

export function ChartDistribution({
  byService,
  byBarber,
  periodLabel,
}: ChartDistributionProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Por serviço</CardTitle>
          <CardDescription>
            {periodLabel
              ? `Reservas por serviço ${periodLabel}`
              : "Reservas por serviço"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {byService.length > 0 ? (
            <ChartContainer
              id="chart-distribution-service"
              config={serviceConfig}
              className="aspect-auto h-[220px] w-full"
            >
              <BarChart
                data={byService}
                layout="vertical"
                margin={{ left: 12 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value} reserva(s)`, "Reservas"]}
                      indicator="dot"
                    />
                  }
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum dado no período
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Por barbeiro</CardTitle>
          <CardDescription>
            {periodLabel
              ? `Reservas por barbeiro ${periodLabel}`
              : "Reservas por barbeiro"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {byBarber.length > 0 ? (
            <ChartContainer
              id="chart-distribution-barber"
              config={barberConfig}
              className="aspect-auto h-[220px] w-full"
            >
              <BarChart data={byBarber} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value} reserva(s)`, "Reservas"]}
                      indicator="dot"
                    />
                  }
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum dado no período
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
