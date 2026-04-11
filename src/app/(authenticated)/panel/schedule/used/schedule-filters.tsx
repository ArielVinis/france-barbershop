"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Label } from "@/src/components/ui/label"
import { SHOP_QUERY_PARAM } from "@/src/lib/panel/shop-query"

export type PeriodValue = "day" | "week" | "month"

const PERIOD_OPTIONS: { value: PeriodValue; label: string }[] = [
  { value: "day", label: "Hoje" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mês" },
]

type BarberOption = { id: string; name: string; barbershopId: string }

type ScheduleFiltersProps = {
  barbers: BarberOption[]
}

export function ScheduleFilters({ barbers }: ScheduleFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const period = (searchParams.get("period") as PeriodValue) ?? "week"
  const shopId = searchParams.get(SHOP_QUERY_PARAM) ?? "all"
  const barberId = searchParams.get("barber") ?? "all"

  const setParams = (updates: {
    period?: string
    barber?: string
    viewDate?: string
  }) => {
    const next = new URLSearchParams(searchParams.toString())
    if (updates.period != null) next.set("period", updates.period)
    if (updates.barber != null) {
      if (updates.barber === "all") next.delete("barber")
      else next.set("barber", updates.barber)
    }
    if (updates.viewDate != null) next.set("viewDate", updates.viewDate)
    router.push(`${pathname}?${next.toString()}`)
  }

  const barbersFiltered =
    shopId === "all"
      ? barbers
      : barbers.filter((b) => b.barbershopId === shopId)
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
