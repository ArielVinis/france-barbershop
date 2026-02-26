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
type BarberOption = { id: string; name: string; barbershopId: string }

type DashboardFiltersProps = {
  barbershops: BarbershopOption[]
  barbers: BarberOption[]
}

export function DashboardFilters({
  barbershops,
  barbers,
}: DashboardFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const period = (searchParams.get("period") as PeriodValue) ?? "week"
  const barbershopId = searchParams.get("barbershop") ?? "all"
  const barberId = searchParams.get("barber") ?? "all"

  const setParams = (updates: {
    period?: string
    barbershop?: string
    barber?: string
  }) => {
    const next = new URLSearchParams(searchParams.toString())
    if (updates.period != null) next.set("period", updates.period)
    if (updates.barbershop != null) {
      next.set("barbershop", updates.barbershop)
      if (updates.barbershop === "all") next.delete("barber")
    }
    if (updates.barber != null) next.set("barber", updates.barber)
    router.push(`/owner?${next.toString()}`)
  }

  const barbersFiltered =
    barbershopId === "all"
      ? barbers
      : barbers.filter((b) => b.barbershopId === barbershopId)
  const barberValue =
    barberId !== "all" && barbersFiltered.some((b) => b.id === barberId)
      ? barberId
      : "all"

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
          onValueChange={(v) => setParams({ barbershop: v, barber: "all" })}
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
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Barbeiro</Label>
        <Select
          value={barberValue}
          onValueChange={(v) => setParams({ barber: v })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {barbersFiltered.map((b) => (
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
