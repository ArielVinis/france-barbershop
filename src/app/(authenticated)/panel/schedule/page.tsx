import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/src/lib/auth"
import { getBarberForUser } from "@/src/lib/authz"
import { getBarberBookings } from "@/src/features/barber/_data/get-barber-bookings"
import { getOwnerByUserId } from "@/src/features/owner/_data/get-owner-by-user-id"
import { getOwnerBarbers } from "@/src/features/owner/_data/get-owner-barbers"
import { getOwnerBookings } from "@/src/features/owner/_data/get-owner-bookings"
import { bookingsToCalendarEvents } from "@/src/lib/booking-calendar-utils"
import { ScheduleFilters } from "./used/schedule-filters"
import { OwnerScheduleCalendar } from "./used/owner-schedule-calendar"
import { OwnerBookingsTable } from "../dashboard/used/dashboard-content/owner-bookings-table"
import { BarberBookingsTable } from "./used/barber-bookings-table"
import { hasOwnerSubscriptionAccess } from "@/src/features/owner/_data/get-owner-subscription-access"
import { hasBarbershopSubscriptionAccess } from "@/src/features/owner/_data/get-barbershop-subscription-access"
import { PATHS } from "@/src/constants/PATHS"
import { resolveShopIdForAggregate } from "@/src/lib/panel/shop-query"
import { ensureBarberShopIdMatchesUrl } from "@/src/lib/panel/ensure-barber-shop-query"

export default async function OwnerSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: string
    shopId?: string
    barber?: string
    viewDate?: string
  }>
}) {
  const user = await getCurrentUser()

  if (user.role === "BARBER") {
    const barber = await getBarberForUser(user.id)
    if (!barber) return null

    const params = await searchParams
    ensureBarberShopIdMatchesUrl(
      PATHS.PANEL.SCHEDULE,
      {
        period: params.period,
        shopId: params.shopId,
        barber: params.barber,
        viewDate: params.viewDate,
      },
      barber.barbershopId,
    )

    const hasSubscriptionAccess = await hasBarbershopSubscriptionAccess(
      barber.barbershopId,
    )
    if (!hasSubscriptionAccess) {
      redirect(PATHS.PANEL.SUBSCRIPTION)
    }

    const period =
      params.period === "day" ||
      params.period === "week" ||
      params.period === "month"
        ? params.period
        : "week"
    const viewDateParam = params.viewDate
    const viewDate = viewDateParam
      ? (() => {
          const d = new Date(viewDateParam)
          return Number.isNaN(d.getTime()) ? new Date() : d
        })()
      : new Date()
    const dateForTable = new Date()

    const [bookingsForTable, bookingsForCalendar] = await Promise.all([
      getBarberBookings(barber.id, period, dateForTable),
      getBarberBookings(barber.id, "month", viewDate),
    ])

    const calendarEvents = bookingsToCalendarEvents(
      bookingsForCalendar.map((b) => ({
        ...b,
        date: b.date,
      })),
    )

    return (
      <div className="flex flex-1 flex-col gap-6">
        <Suspense fallback={<div className="h-10 px-4 lg:px-6" />}>
          <ScheduleFilters barbers={[]} variant="barber" />
        </Suspense>

        <div className="px-4 lg:px-6">
          <h2 className="mb-1 text-lg font-semibold">Calendário</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Os seus agendamentos no mês visível.
          </p>
          <OwnerScheduleCalendar events={calendarEvents} viewDate={viewDate} />
        </div>

        <div className="px-4 lg:px-6">
          <h2 className="mb-1 text-lg font-semibold">Meus agendamentos</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Filtrar por período. Atualize estado pelo menu de cada linha.
          </p>
          <BarberBookingsTable
            bookings={JSON.parse(JSON.stringify(bookingsForTable))}
          />
        </div>
      </div>
    )
  }

  const owner = await getOwnerByUserId(user.id)
  if (!owner) return null
  const hasSubscriptionAccess = await hasOwnerSubscriptionAccess(
    owner.user.email,
  )
  if (!hasSubscriptionAccess) {
    redirect(PATHS.PANEL.SUBSCRIPTION)
  }

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
  const barbershopIds = owner.barbershops.map((b) => b.id)
  const shopResolved = resolveShopIdForAggregate(params.shopId, barbershopIds)
  const barbershopId =
    shopResolved === "all" || shopResolved === null ? null : shopResolved

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
        <ScheduleFilters barbers={barbersForFilter} />
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
