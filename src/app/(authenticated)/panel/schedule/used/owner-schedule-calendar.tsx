"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, startOfWeek, getDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { PATHS } from "@/src/constants/PATHS"
import type { CalendarEvent } from "@/src/lib/booking-calendar-utils"
import "./owner-schedule-calendar.css"

const locales = { "pt-BR": ptBR }
const localizer = dateFnsLocalizer({
  format,
  startOfWeek: (d: Date) => startOfWeek(d, { weekStartsOn: 0, locale: ptBR }),
  getDay,
  locales,
})

type OwnerScheduleCalendarProps = {
  events: CalendarEvent[]
  viewDate: Date
}

export function OwnerScheduleCalendar({
  events,
  viewDate,
}: OwnerScheduleCalendarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const onNavigate = useCallback(
    (newDate: Date) => {
      const next = new URLSearchParams(searchParams.toString())
      next.set("viewDate", format(newDate, "yyyy-MM-dd"))
      router.push(`${PATHS.OWNER.SCHEDULE}?${next.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <div className="owner-schedule-calendar h-[80dvh] rounded-lg border bg-card px-4 py-4 lg:px-6">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        date={viewDate}
        onNavigate={onNavigate}
        culture="pt-BR"
        messages={{
          today: "Hoje",
          previous: "Anterior",
          next: "Próximo",
          month: "Mês",
          week: "Semana",
          day: "Dia",
          agenda: "Agenda",
          date: "Data",
          time: "Hora",
          event: "Evento",
          noEventsInRange: "Nenhum agendamento neste período.",
        }}
      />
    </div>
  )
}
