import { BOOKING_STATUS_OPTIONS } from "@/src/features/booking/booking.types"

export function ScheduleStatusLegend() {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {BOOKING_STATUS_OPTIONS.map((s) => (
        <li key={s.id}>{s.label}</li>
      ))}
      <li>Cancelado / faltou ficam mais claros no calendário</li>
    </ul>
  )
}