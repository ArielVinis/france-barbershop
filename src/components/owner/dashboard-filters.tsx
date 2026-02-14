"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Label } from "@/src/components/ui/label"

export type PeriodValue = "day" | "week" | "month"

const PERIOD_OPTIONS: { value: PeriodValue; label: string }[] = [
  { value: "day", label: "Hoje" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mês" },
]

type BarbershopOption = { id: string; name: string }

type DashboardFiltersProps = {
  barbershops: BarbershopOption[]
}

export function DashboardFilters({ barbershops }: DashboardFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const period = (searchParams.get("period") as PeriodValue) ?? "week"
  const barbershopId = searchParams.get("barbershop") ?? "all"

  const setParams = (updates: { period?: string; barbershop?: string }) => {
    const next = new URLSearchParams(searchParams.toString())
    if (updates.period != null) next.set("period", updates.period)
    if (updates.barbershop != null) next.set("barbershop", updates.barbershop)
    router.push(`/owner?${next.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-end gap-4 px-4 lg:px-6">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Período</Label>
        <Select value={period} onValueChange={(v) => setParams({ period: v })}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Barbearia</Label>
        <Select
          value={barbershopId}
          onValueChange={(v) => setParams({ barbershop: v })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {barbershops.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
