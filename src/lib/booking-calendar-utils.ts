import { addMinutes } from "date-fns"

export type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  resource?: { bookingId: string }
}

/**
 * Converte bookings em eventos para o React Big Calendar.
 * Função pura, segura para uso em Server Components.
 */
export function bookingsToCalendarEvents(
  bookings: {
    id: string
    date: Date
    user: { name: string }
    service: { name: string; durationMinutes: number }
    barber?: { user: { name: string } } | null
  }[],
): CalendarEvent[] {
  return bookings.map((b) => {
    const start = new Date(b.date)
    const end = addMinutes(start, b.service.durationMinutes)
    const barberName = b.barber?.user.name
    const title = barberName
      ? `${b.user.name} — ${b.service.name} (${barberName})`
      : `${b.user.name} — ${b.service.name}`
    return {
      id: b.id,
      title,
      start,
      end,
      resource: { bookingId: b.id },
    }
  })
}
