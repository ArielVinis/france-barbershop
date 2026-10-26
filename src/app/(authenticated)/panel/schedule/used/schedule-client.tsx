"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { addDays } from "date-fns"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { toast } from "sonner"
import type { BookingStatus, PaymentMethod } from "@/prisma/generated/prisma/client"
import { PanelPage } from "@/src/app/(authenticated)/panel/_components/panel-page"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import {
  updateBookingStatus,
  updateBookingStatusOwner,
} from "@/src/features/booking/booking.panel.actions"
import type { OwnerBookingRow } from "@/src/features/booking/booking.types"
import {
  bookingsToCalendarEvents,
  type CalendarEvent,
} from "@/src/features/schedule/_lib/booking-calendar-utils"
import { PATHS } from "@/src/shared/constants/PATHS"
import {
  formatAppZonedDateParam,
  isSameAppZonedDay,
  parseAppZonedDateParam,
} from "@/src/shared/lib/timezone-utils"
import { BookingFormDialog } from "./booking-form-dialog"
import { BookingRow } from "./booking-row"
import { OwnerScheduleCalendar } from "./owner-schedule-calendar"
import { ScheduleFilters } from "./schedule-filters"
import { ScheduleStatusLegend } from "./schedule-status-legend"

type Option = { id: string; name: string }

export function ScheduleClient({
  bookings,
  barbers,
  services,
  clients,
  viewDateIso,
  listDateIso,
  canManage,
  defaultMemberId,
}: {
  bookings: OwnerBookingRow[]
  barbers: Option[]
  services: Option[]
  clients: Option[]
  viewDateIso: string
  listDateIso: string
  canManage: boolean
  defaultMemberId: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<OwnerBookingRow | null>(null)
  const [upcomingOpen, setUpcomingOpen] = useState(false)
  const [finishDialog, setFinishDialog] = useState<{
    id: string
    paymentMethod: PaymentMethod
  } | null>(null)

  const view = searchParams.get("view") === "lista" ? "lista" : "calendario"
  const barberFilter = (searchParams.get("barber") ?? "")
    .split(",")
    .filter(Boolean)
  const statusFilter = (searchParams.get("status") ?? "")
    .split(",")
    .filter(Boolean)

  const viewDate = parseAppZonedDateParam(viewDateIso) ?? new Date()
  const listDate = parseAppZonedDateParam(listDateIso) ?? new Date()

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (barberFilter.length && (!b.memberId || !barberFilter.includes(b.memberId))) {
        return false
      }
      if (statusFilter.length && !statusFilter.includes(b.status)) return false
      return true
    })
  }, [bookings, barberFilter, statusFilter])

  const dayBookings = useMemo(
    () =>
      filtered
        .filter((b) => isSameAppZonedDay(new Date(b.date), listDate))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
    [filtered, listDate],
  )

  const upcoming = useMemo(() => {
    const now = Date.now()
    return filtered
      .filter((b) => new Date(b.date).getTime() > now)
      .filter((b) => !isSameAppZonedDay(new Date(b.date), listDate))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 20)
  }, [filtered, listDate])

  const calendarEvents = useMemo(
    () => bookingsToCalendarEvents(filtered),
    [filtered],
  )

  const bookingsById = useMemo(() => {
    const map = new Map<string, OwnerBookingRow>()
    for (const b of bookings) map.set(b.id, b)
    return map
  }, [bookings])

  function setParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value == null || value === "") next.delete(key)
      else next.set(key, value)
    }
    router.push(`${PATHS.PANEL.SCHEDULE}?${next.toString()}`)
  }

  function navigateList(days: number) {
    const next = addDays(listDate, days)
    const iso = formatAppZonedDateParam(next)
    const monthChanged = iso.slice(0, 7) !== viewDateIso.slice(0, 7)
    setParams({
      date: iso,
      viewDate: monthChanged ? iso : viewDateIso,
    })
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(booking: OwnerBookingRow) {
    if (!canManage) return
    setEditing(booking)
    setFormOpen(true)
  }

  function openEditById(id: string) {
    const booking = bookingsById.get(id)
    if (booking) openEdit(booking)
  }

  function changeStatus(id: string, status: BookingStatus) {
    if (status === "FINISHED") {
      setFinishDialog({ id, paymentMethod: "PIX" })
      return
    }
    startTransition(async () => {
      try {
        if (canManage) await updateBookingStatusOwner(id, status)
        else await updateBookingStatus(id, status)
        toast.success("Status atualizado")
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao atualizar")
      }
    })
  }

  function finishBooking() {
    if (!finishDialog) return
    startTransition(async () => {
      try {
        const options = {
          paymentMethod: finishDialog.paymentMethod,
          paymentStatus: "PAID" as const,
        }
        if (canManage) {
          await updateBookingStatusOwner(finishDialog.id, "FINISHED", options)
        } else {
          await updateBookingStatus(finishDialog.id, "FINISHED", options)
        }
        toast.success("Atendimento finalizado")
        setFinishDialog(null)
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao finalizar")
      }
    })
  }

  const isCalendar = view === "calendario"
  const upcomingGroups = useMemo(() => {
    const groups: { date: string; items: OwnerBookingRow[] }[] = []
    let last: string | null = null
    for (const b of upcoming) {
      const iso = formatAppZonedDateParam(new Date(b.date))
      if (iso !== last) {
        groups.push({ date: iso, items: [] })
        last = iso
      }
      groups[groups.length - 1].items.push(b)
    }
    return groups
  }, [upcoming])

  return (
    <PanelPage
      title="Agenda"
      fillViewport={isCalendar}
      contentClassName={
        isCalendar
          ? "flex min-h-0 flex-1 flex-col gap-3 px-4 pb-2 pt-0 md:gap-3 md:pb-3 lg:px-6"
          : "px-4 lg:px-6"
      }
      rightContent={
        canManage ? (
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Novo agendamento
          </Button>
        ) : undefined
      }
    >
      <div
        className={
          isCalendar
            ? "flex min-h-0 flex-1 flex-col gap-3"
            : "flex min-h-full flex-1 flex-col gap-4"
        }
      >
        <ScheduleFilters
          barbers={barbers}
          defaultMemberId={defaultMemberId}
          variant={canManage ? "owner" : "barber"}
        />

        <Tabs
          value={view}
          className={isCalendar ? "flex min-h-0 flex-1 flex-col" : undefined}
          onValueChange={(next) =>
            setParams({
              view: next === "lista" ? "lista" : null,
              date: next === "lista" ? listDateIso : null,
            })
          }
        >
          <TabsList>
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
            <TabsTrigger value="lista">Lista</TabsTrigger>
          </TabsList>

          <TabsContent
            value="calendario"
            className="mt-3 flex min-h-0 flex-1 flex-col gap-2"
          >
            <ScheduleStatusLegend />
            <OwnerScheduleCalendar
              events={calendarEvents}
              viewDate={viewDate}
              resources={barbers.map((b) => ({ id: b.id, title: b.name }))}
              canReschedule={canManage}
              fillViewport
              onSelectEvent={(event: CalendarEvent) => openEditById(event.id)}
            />
          </TabsContent>

          <TabsContent value="lista" className="mt-3 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => navigateList(-1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setParams({
                    date: formatAppZonedDateParam(new Date()),
                  })
                }
              >
                Hoje
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => navigateList(1)}
              >
                <ChevronRight className="size-4" />
              </Button>
              <Input
                type="date"
                className="w-auto"
                value={listDateIso}
                onChange={(e) => {
                  const iso = e.target.value
                  if (!iso) return
                  const monthChanged = iso.slice(0, 7) !== viewDateIso.slice(0, 7)
                  setParams({
                    date: iso,
                    viewDate: monthChanged ? iso : viewDateIso,
                  })
                }}
              />
              <p className="text-sm capitalize text-muted-foreground">
                {format(listDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
            </div>

            {dayBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum agendamento para este dia.
              </p>
            ) : (
              <ul className="space-y-2">
                {dayBookings.map((booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    pending={pending}
                    onEdit={openEdit}
                    onStatus={changeStatus}
                  />
                ))}
              </ul>
            )}

            <details
              open={upcomingOpen}
              onToggle={(e) =>
                setUpcomingOpen((e.target as HTMLDetailsElement).open)
              }
            >
              <summary className="cursor-pointer text-sm font-medium">
                Próximos ({upcoming.length})
              </summary>
              <div className="mt-2 space-y-3">
                {upcomingGroups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum agendamento futuro neste mês.
                  </p>
                ) : (
                  upcomingGroups.map((group) => (
                    <div key={group.date} className="space-y-2">
                      <p className="text-xs font-medium uppercase text-muted-foreground">
                        {format(
                          parseAppZonedDateParam(group.date) ?? new Date(),
                          "EEEE, d 'de' MMMM",
                          { locale: ptBR },
                        )}
                      </p>
                      <ul className="space-y-2">
                        {group.items.map((booking) => (
                          <BookingRow
                            key={booking.id}
                            booking={booking}
                            pending={pending}
                            onEdit={openEdit}
                            onStatus={changeStatus}
                          />
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </details>
          </TabsContent>
        </Tabs>
      </div>

      {canManage ? (
        <BookingFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          clients={clients}
          services={services}
          barbers={barbers}
          initial={editing}
          defaultDate={listDateIso}
          defaultMemberId={defaultMemberId}
          pending={pending}
          startTransition={startTransition}
        />
      ) : null}

      <Dialog
        open={Boolean(finishDialog)}
        onOpenChange={(open) => {
          if (!open) setFinishDialog(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar atendimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Forma de pagamento</Label>
            <Select
              value={finishDialog?.paymentMethod ?? "PIX"}
              onValueChange={(value) =>
                setFinishDialog((prev) =>
                  prev ? { ...prev, paymentMethod: value as PaymentMethod } : prev,
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">Pix</SelectItem>
                <SelectItem value="CASH">Dinheiro</SelectItem>
                <SelectItem value="CREDIT_CARD">Cartão de crédito</SelectItem>
                <SelectItem value="DEBIT_CARD">Cartão de débito</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFinishDialog(null)}>
              Cancelar
            </Button>
            <Button type="button" onClick={finishBooking} disabled={pending}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PanelPage>
  )
}
