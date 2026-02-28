import { Suspense } from "react"
import Link from "next/link"
import { getCurrentUser } from "@/src/lib/auth"
import { getOwnerByUserId } from "@/src/features/owner/_data/get-owner-by-user-id"
import { getOwnerBarbers } from "@/src/features/owner/_data/get-owner-barbers"
import { getOwnerBookings } from "@/src/features/owner/_data/get-owner-bookings"
import { bookingsToCalendarEvents } from "@/src/lib/booking-calendar-utils"
import { ScheduleFilters } from "./used/schedule-filters"
import { OwnerScheduleCalendar } from "./used/owner-schedule-calendar"
import { OwnerBookingsTable } from "../dashboard/used/dashboard-content/owner-bookings-table"

export default async function OwnerSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: string
    barbershop?: string
    barber?: string
    viewDate?: string
  }>
}) {
  const user = await getCurrentUser()
  const owner = await getOwnerByUserId(user.id)
  if (!owner) return null

  if (owner.barbershops.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="max-w-md rounded-lg border bg-card p-6 text-center">
          <h2 className="text-lg font-semibold">Nenhuma barbearia vinculada</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu usuário ainda não está vinculado a nenhuma barbearia.
          </p>
          {process.env.NODE_ENV === "development" && (
            <Link
              href="/dev/owner"
              className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4"
            >
              Dev: Vincular barbearia →
            </Link>
          )}
        </div>
      </div>
    )
  }

  const params = await searchParams
  const period =
    params.period === "day" ||
    params.period === "week" ||
    params.period === "month"
      ? params.period
      : "week"
  const barbershopId =
    params.barbershop &&
    owner.barbershops.some((b) => b.id === params.barbershop)
      ? params.barbershop
      : null
  const barbers = await getOwnerBarbers(user.id, barbershopId ?? undefined)
  const barberId =
    params.barber && barbers.some((b) => b.id === params.barber)
      ? params.barber
      : null

  const viewDateParam = params.viewDate
  const viewDate = viewDateParam
    ? (() => {
        const d = new Date(viewDateParam)
        return Number.isNaN(d.getTime()) ? new Date() : d
      })()
    : new Date()

  const barbershopIds = owner.barbershops.map((b) => b.id)
  const dateForTable = new Date()

  const [bookingsForTable, bookingsForCalendar] = await Promise.all([
    getOwnerBookings(barbershopIds, {
      period,
      barbershopId,
      barberId,
      date: dateForTable,
    }),
    getOwnerBookings(barbershopIds, {
      period: "month",
      barbershopId,
      barberId,
      date: viewDate,
    }),
  ])

  const barbershops = owner.barbershops.map((b) => ({ id: b.id, name: b.name }))
  const barbersForFilter = barbers.map((b) => ({
    id: b.id,
    name: b.user.name ?? "Barbeiro",
    barbershopId: b.barbershop.id,
  }))

  const calendarEvents = bookingsToCalendarEvents(
    bookingsForCalendar.map((b) => ({
      ...b,
      date: b.date,
    })),
  )

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Suspense fallback={<div className="h-10 px-4 lg:px-6" />}>
        <ScheduleFilters barbershops={barbershops} barbers={barbersForFilter} />
      </Suspense>

      <div className="px-4 lg:px-6">
        <h2 className="mb-1 text-lg font-semibold">Calendário</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Navegue pelos meses para ver os agendamentos.
        </p>
        <OwnerScheduleCalendar events={calendarEvents} viewDate={viewDate} />
      </div>

      <div className="px-4 lg:px-6">
        <h2 className="mb-1 text-lg font-semibold">Agendamentos gerais</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Visão geral de todos os agendamentos. Filtre por período, barbearia e
          barbeiro. Cancelar ou realocar pelos ícones do menu.
        </p>
        <OwnerBookingsTable
          bookings={JSON.parse(JSON.stringify(bookingsForTable))}
          barbers={barbersForFilter}
        />
      </div>
    </div>
  )
}
