import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/src/server/auth/users"
import { getBarberMemberForUser } from "@/src/shared/guards"
import { getBarberScheduleBookings } from "@/src/features/booking/booking.panel.actions"
import { getOwnerByUserId } from "@/src/features/organization/organization.actions"
import { getOwnerBarbers } from "@/src/features/member/member.panel.actions"
import { getOwnerScheduleBookings } from "@/src/features/booking/booking.panel.actions"
import {
  bookingsToCalendarEvents,
  type BookingForCalendarEvent,
} from "@/src/features/schedule/_lib/booking-calendar-utils"
import type { OwnerBookingRow } from "@/src/features/booking/booking.types"
import type { OwnerBarberListRow } from "@/src/features/member/member.types"
import { ScheduleFilters } from "./used/schedule-filters"
import { OwnerScheduleCalendar } from "./used/owner-schedule-calendar"
import { OwnerBookingsTable } from "../dashboard/used/dashboard-content/owner-bookings-table"
import { BarberBookingsTable } from "./used/barber-bookings-table"
import { hasOwnerSubscriptionAccess } from "@/src/features/subscription/subscription.actions"
import { hasBarbershopSubscriptionAccess } from "@/src/features/subscription/subscription.actions"
import { PATHS } from "@/src/shared/constants/PATHS"
import { resolveOrganizationIdForAggregate } from "@/src/shared/guards/panel/organization-query"
import { ensureBarberShopIdMatchesUrl } from "@/src/shared/guards/panel/ensure-barber-shop-query"
import { parseAppZonedDateParam } from "@/src/shared/lib/timezone-utils"
import { Role } from "@/prisma/generated/prisma/enums"

export default async function OwnerSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: string
    organizationId?: string
    barber?: string
    viewDate?: string
  }>
}) {
  const { user } = await getCurrentUser()

  if (user.role === Role.MEMBER) {
    const barber = await getBarberMemberForUser(user.id)
    if (!barber) return null

    const params = await searchParams
    ensureBarberShopIdMatchesUrl(
      PATHS.PANEL.SCHEDULE,
      {
        period: params.period,
        shopId: params.organizationId,
        barber: params.barber,
        viewDate: params.viewDate,
      },
      barber.organizationId,
    )

    const hasSubscriptionAccess = await hasBarbershopSubscriptionAccess(
      barber.organizationId,
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
      ? (parseAppZonedDateParam(viewDateParam) ?? new Date())
      : new Date()
    const dateForTable = new Date()

    const { forTable: bookingsForTable, forCalendar: bookingsForCalendar } =
      await getBarberScheduleBookings(barber.id, {
        tablePeriod: period,
        tableDate: dateForTable,
        calendarDate: viewDate,
      })

    const calendarEvents = bookingsToCalendarEvents(
      bookingsForCalendar as unknown as BookingForCalendarEvent[],
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
          <OwnerScheduleCalendar
            events={calendarEvents}
            viewDate={viewDate}
            canReschedule={false}
          />
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

  if (owner.organizations.length === 0) {
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
  const organizationIds = owner.organizations.map((b) => b.id)
  const shopResolved = resolveOrganizationIdForAggregate(
    params.organizationId,
    organizationIds,
  )
  const organizationId =
    shopResolved === "all" || shopResolved === null ? null : shopResolved

  const barbers = (await getOwnerBarbers(
    user.id,
    organizationId ?? undefined,
  )) as OwnerBarberListRow[]
  const barberId =
    params.barber && barbers.some((b) => b.id === params.barber)
      ? params.barber
      : null

  const viewDateParam = params.viewDate
  const viewDate = viewDateParam
    ? (parseAppZonedDateParam(viewDateParam) ?? new Date())
    : new Date()

  const dateForTable = new Date()

  const { forTable: bookingsForTable, forCalendar: bookingsForCalendar } =
    await getOwnerScheduleBookings(organizationIds, {
      tablePeriod: period,
      organizationId,
      memberId: barberId,
      tableDate: dateForTable,
      calendarDate: viewDate,
    })

  const barbersForFilter = barbers.map((b) => ({
    id: b.id,
    name: b.user.name ?? "Barbeiro",
    organizationId: b.organization.id,
  }))

  const calendarEvents = bookingsToCalendarEvents(
    bookingsForCalendar as unknown as BookingForCalendarEvent[],
  )

  const calendarResources = barbersForFilter.map((b) => ({
    id: b.id,
    title: b.name,
  }))

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Suspense fallback={<div className="h-10 px-4 lg:px-6" />}>
        <ScheduleFilters barbers={barbersForFilter} />
      </Suspense>

      <div className="px-4 lg:px-6">
        <h2 className="mb-1 text-lg font-semibold">Calendário</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Vista por dia com colunas por barbeiro. Arraste um agendamento para
          mudar o horário ou o barbeiro.
        </p>
        <OwnerScheduleCalendar
          events={calendarEvents}
          viewDate={viewDate}
          resources={calendarResources}
          canReschedule
        />
      </div>

      <div className="px-4 lg:px-6">
        <h2 className="mb-1 text-lg font-semibold">Agendamentos gerais</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Visão geral de todos os agendamentos. Filtre por período, barbearia e
          barbeiro. Cancelar ou realocar pelos ícones do menu.
        </p>
        <OwnerBookingsTable
          bookings={
            JSON.parse(
              JSON.stringify(bookingsForTable),
            ) as OwnerBookingRow[]
          }
          barbers={barbersForFilter}
        />
      </div>
    </div>
  )
}
