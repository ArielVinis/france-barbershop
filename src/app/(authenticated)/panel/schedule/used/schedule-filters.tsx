"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { EntityMultiCombobox } from "@/src/components/entity-multi-combobox"
import { BOOKING_STATUS_OPTIONS } from "@/src/features/booking/booking.types"

type BarberOption = { id: string; name: string }

export function ScheduleFilters({
  barbers,
  defaultMemberId,
  variant = "owner",
}: {
  barbers: BarberOption[]
  defaultMemberId?: string
  variant?: "owner" | "barber"
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const barberFilter = (searchParams.get("barber") ?? "")
    .split(",")
    .filter(Boolean)
  const statusFilter = (searchParams.get("status") ?? "")
    .split(",")
    .filter(Boolean)
  const onlyMe =
    Boolean(defaultMemberId) &&
    barberFilter.length === 1 &&
    barberFilter[0] === defaultMemberId

  function setParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value == null || value === "") next.delete(key)
      else next.set(key, value)
    }
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <EntityMultiCombobox
        options={BOOKING_STATUS_OPTIONS.map((s) => ({
          id: s.id,
          name: s.label,
        }))}
        value={statusFilter}
        onValueChange={(next) =>
          setParams({ status: next.length ? next.join(",") : null })
        }
        placeholder="Status"
        emptyText="Nenhum status"
        className="w-full sm:w-44"
        aria-label="Filtrar por status"
      />
      {variant === "owner" && barbers.length > 0 ? (
        <EntityMultiCombobox
          options={barbers}
          value={barberFilter}
          onValueChange={(next) =>
            setParams({ barber: next.length ? next.join(",") : null, me: null })
          }
          placeholder="Barbeiros"
          emptyText="Nenhum barbeiro"
          className="w-full sm:w-56"
          aria-label="Filtrar por barbeiro"
        />
      ) : null}
      {variant === "owner" && defaultMemberId ? (
        <Button
          type="button"
          size="sm"
          variant={onlyMe ? "default" : "outline"}
          onClick={() =>
            onlyMe
              ? setParams({ barber: null, me: null })
              : setParams({ barber: defaultMemberId, me: "1" })
          }
        >
          Só eu
        </Button>
      ) : null}
    </div>
  )
}
