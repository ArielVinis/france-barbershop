"use client"

import { useCallback, useMemo, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Calendar,
  Views,
  dateFnsLocalizer,
  type View,
} from "react-big-calendar"
import withDragAndDrop, {
  type withDragAndDropProps,
} from "react-big-calendar/lib/addons/dragAndDrop"
import { format, startOfWeek, getDay, set } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import "react-big-calendar/lib/css/react-big-calendar.css"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"
import { PATHS } from "@/src/shared/constants/PATHS"
import { formatAppZonedDateParam } from "@/src/shared/lib/timezone-utils"
import { rescheduleBookingOwner } from "@/src/features/booking/booking.panel.actions"
import {
  buildBarberColorMap,
  NEUTRAL_EVENT_COLOR,
  type CalendarEvent,
  type CalendarResource,
} from "@/src/features/schedule/_lib/booking-calendar-utils"
import "./owner-schedule-calendar.css"

const locales = { "pt-BR": ptBR }
const localizer = dateFnsLocalizer({
  format,
  startOfWeek: (d: Date) => startOfWeek(d, { weekStartsOn: 0, locale: ptBR }),
  getDay,
  locales,
})

const DnDCalendar = withDragAndDrop<CalendarEvent, CalendarResource>(Calendar)

type OwnerScheduleCalendarProps = {
  events: CalendarEvent[]
  viewDate: Date
  /** Barbeiros para colunas por barbeiro (vista Dia). Vazio = sem colunas. */
  resources?: CalendarResource[]
  /** Só o dono pode realocar via drag-drop. */
  canReschedule?: boolean
}

const CALENDAR_MESSAGES = {
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
  showMore: (total: number) => `+${total} mais`,
}

export function OwnerScheduleCalendar({
  events,
  viewDate,
  resources = [],
  canReschedule = false,
}: OwnerScheduleCalendarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [view, setView] = useState<View>(Views.DAY)
  const [isPending, startTransition] = useTransition()
  const [localEvents, setLocalEvents] = useState(events)
  const [prevEvents, setPrevEvents] = useState(events)

  if (events !== prevEvents) {
    setPrevEvents(events)
    setLocalEvents(events)
  }

  const colorMap = useMemo(
    () => buildBarberColorMap(resources.map((r) => r.id)),
    [resources],
  )

  // Colunas por barbeiro só fazem sentido na vista Dia e quando há barbeiros.
  const showResources = view === Views.DAY && resources.length > 0

  const onNavigate = useCallback(
    (newDate: Date) => {
      const next = new URLSearchParams(searchParams.toString())
      next.set("viewDate", formatAppZonedDateParam(newDate))
      router.push(`${PATHS.PANEL.SCHEDULE}?${next.toString()}`)
    },
    [router, searchParams],
  )

  const eventPropGetter = useCallback(
    (event: CalendarEvent) => {
      const color = event.resourceId
        ? (colorMap[event.resourceId] ?? NEUTRAL_EVENT_COLOR)
        : NEUTRAL_EVENT_COLOR
      const isCancelled =
        event.status === "CANCELLED" || event.status === "NO_SHOW"
      return {
        style: {
          backgroundColor: color.bg,
          borderColor: color.border,
          opacity: isCancelled ? 0.55 : 1,
        },
      }
    },
    [colorMap],
  )

  const moveEvent = useCallback<
    NonNullable<withDragAndDropProps["onEventDrop"]>
  >(
    ({ event, start, resourceId }) => {
      if (!canReschedule) return
      const typed = event as CalendarEvent
      const newStart = start instanceof Date ? start : new Date(start)
      const durationMs = typed.end.getTime() - typed.start.getTime()
      const targetBarberId =
        typeof resourceId === "string" ? resourceId : undefined

      const previous = localEvents
      setLocalEvents((prev) =>
        prev.map((e) =>
          e.id === typed.id
            ? {
                ...e,
                start: newStart,
                end: new Date(newStart.getTime() + durationMs),
                resourceId: targetBarberId ?? e.resourceId,
              }
            : e,
        ),
      )

      startTransition(async () => {
        try {
          await rescheduleBookingOwner(typed.id, newStart, targetBarberId)
          toast.success("Agendamento realocado")
          router.refresh()
        } catch (e) {
          setLocalEvents(previous)
          toast.error(e instanceof Error ? e.message : "Erro ao realocar")
        }
      })
    },
    [canReschedule, localEvents, router],
  )

  return (
    <div className="owner-schedule-calendar rounded-xl border bg-card p-3 shadow-sm lg:p-4">
      <DnDCalendar
        localizer={localizer}
        events={localEvents}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        date={viewDate}
        onNavigate={onNavigate}
        view={view}
        onView={(v) => setView(v)}
        views={[Views.DAY, Views.WEEK, Views.MONTH, Views.AGENDA]}
        step={30}
        timeslots={2}
        min={set(new Date(), { hours: 0, minutes: 0, seconds: 0 })}
        max={set(new Date(), { hours: 23, minutes: 59, seconds: 59 })}
        scrollToTime={set(new Date(), { hours: 8, minutes: 0, seconds: 0 })}
        popup
        culture="pt-BR"
        style={{ height: "76dvh" }}
        resources={showResources ? resources : undefined}
        resourceIdAccessor={(r: CalendarResource) => r.id}
        resourceTitleAccessor={(r: CalendarResource) => r.title}
        eventPropGetter={eventPropGetter}
        onEventDrop={moveEvent}
        draggableAccessor={() => canReschedule && !isPending}
        resizable={false}
        selectable={false}
        messages={CALENDAR_MESSAGES}
      />
    </div>
  )
}
