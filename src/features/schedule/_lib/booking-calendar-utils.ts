import { addMinutes } from "date-fns"

export type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  /** memberId do barbeiro — usado para colunas por barbeiro e alvo do drag-drop. */
  resourceId?: string
  clientName: string
  serviceName: string
  barberName?: string
  status?: string
  resource?: { bookingId: string }
}

/** Coluna do calendário (um barbeiro). */
export type CalendarResource = {
  id: string
  title: string
}

/** Dados mínimos de um booking para montar o evento no calendário. */
export type BookingForCalendarEvent = {
  id: string
  date: Date | string
  status?: string
  user: { name: string | null }
  service: { name: string; durationMinutes: number }
  member?: { id: string; user: { name: string | null } } | null
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
    const barberName = b.member?.user.name ?? undefined
    const title = barberName
      ? `${clientName} — ${b.service.name} (${barberName})`
      : `${clientName} — ${b.service.name}`
    return {
      id: b.id,
      title,
      start,
      end,
      resourceId: b.member?.id,
      clientName,
      serviceName: b.service.name,
      barberName,
      status: b.status,
      resource: { bookingId: b.id },
    }
  })
}

/**
 * Paleta de cores para diferenciar barbeiros no calendário.
 * Baseada nos acentos funcionais do design system do Cal.com
 * (marca grayscale + acentos: azul, esmeralda, violeta, rosa, laranja…).
 */
export const BARBER_COLOR_PALETTE = [
  { bg: "#3b82f6", border: "#2563eb" }, // blue (accent do Cal.com)
  { bg: "#10b981", border: "#059669" }, // emerald
  { bg: "#8b5cf6", border: "#7c3aed" }, // violet
  { bg: "#fb923c", border: "#ea580c" }, // orange
  { bg: "#ec4899", border: "#db2777" }, // pink
  { bg: "#0099ff", border: "#0284c7" }, // action blue (link do Cal.com)
  { bg: "#14b8a6", border: "#0d9488" }, // teal
  { bg: "#f59e0b", border: "#d97706" }, // amber
  { bg: "#f43f5e", border: "#e11d48" }, // rose
  { bg: "#6366f1", border: "#4f46e5" }, // indigo
] as const

export type BarberColor = { bg: string; border: string }

/**
 * Eventos sem barbeiro atribuído usam o grafite near-black do Cal.com
 * (a cor padrão de evento deles).
 */
export const NEUTRAL_EVENT_COLOR: BarberColor = {
  bg: "#242424",
  border: "#111111",
}

/**
 * Constrói um mapa estável `memberId -> cor` a partir da ordem dos barbeiros.
 * A mesma lista de barbeiros produz sempre as mesmas cores.
 */
export function buildBarberColorMap(
  barberIds: string[],
): Record<string, BarberColor> {
  const map: Record<string, BarberColor> = {}
  barberIds.forEach((id, index) => {
    map[id] = BARBER_COLOR_PALETTE[index % BARBER_COLOR_PALETTE.length]
  })
  return map
}
