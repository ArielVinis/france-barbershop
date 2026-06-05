import { addMinutes } from "date-fns"

export type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  resource?: { bookingId: string }
}

/** Dados mínimos de um booking para montar o título do evento no calendário. */
export type BookingForCalendarEvent = {
  id: string
  date: Date | string
  user: { name: string | null }
  service: { name: string; durationMinutes: number }
  member?: { user: { name: string | null } } | null
}

/**
 * Converte bookings em eventos para o React Big Calendar.
 * Função pura, segura para uso em Server Components.
 */
export function bookingsToCalendarEvents(
  bookings: BookingForCalendarEvent[],
): CalendarEvent[] {
  return bookings.map((b) => {
    const start = new Date(b.date)
    const end = addMinutes(start, b.service.durationMinutes)
    const clientName = b.user.name ?? "Cliente"
    const barberName = b.member?.user.name
    const title = barberName
      ? `${clientName} — ${b.service.name} (${barberName})`
      : `${clientName} — ${b.service.name}`
    return {
      id: b.id,
      title,
      start,
      end,
      resource: { bookingId: b.id },
    }
  })
}
