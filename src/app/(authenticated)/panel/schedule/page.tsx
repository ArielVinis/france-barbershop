import Link from "next/link"
import { redirect } from "next/navigation"
import { Role } from "@/prisma/generated/prisma/enums"
import { getCurrentUser } from "@/src/server/auth/users"
import { getBarberMemberForUser } from "@/src/shared/guards"
import {
  getBarberScheduleBookings,
  getOwnerScheduleBookings,
  listOrganizationClients,
} from "@/src/features/booking/booking.panel.actions"
import { getOwnerByUserId } from "@/src/features/organization/organization.actions"
import { getOwnerBarbers } from "@/src/features/member/member.panel.actions"
import { getOwnerServices } from "@/src/features/service/service.panel.actions"
import type { OwnerBookingRow } from "@/src/features/booking/booking.types"
import type { OwnerBarberListRow } from "@/src/features/member/member.types"
import {
  hasBarbershopSubscriptionAccess,
  hasOwnerSubscriptionAccess,
} from "@/src/features/subscription/subscription.actions"
import { PATHS } from "@/src/shared/constants/PATHS"
import { resolveOrganizationIdForAggregate } from "@/src/shared/guards/panel/organization-query"
import { ensureBarberShopIdMatchesUrl } from "@/src/shared/guards/panel/ensure-barber-shop-query"
import {
  formatAppZonedDateParam,
  parseAppZonedDateParam,
} from "@/src/shared/lib/timezone-utils"
import { ScheduleClient } from "./used/schedule-client"

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{
    organizationId?: string
    barber?: string
    viewDate?: string
    date?: string
  }>
}) {
  const { user } = await getCurrentUser()
  const params = await searchParams
  const viewDate =
    parseAppZonedDateParam(params.viewDate ?? "") ?? new Date()
  const listDate = parseAppZonedDateParam(params.date ?? "") ?? viewDate
  const viewDateIso = formatAppZonedDateParam(viewDate)
  const listDateIso = formatAppZonedDateParam(listDate)

  if (user.role === Role.MEMBER) {
    const barber = await getBarberMemberForUser(user.id)
    if (!barber) return null

    ensureBarberShopIdMatchesUrl(
      PATHS.PANEL.SCHEDULE,
      {
        shopId: params.organizationId,
        barber: params.barber,
        viewDate: params.viewDate,
      },
      barber.organizationId,
    )

    if (!(await hasBarbershopSubscriptionAccess(barber.organizationId))) {
      redirect(PATHS.PANEL.SUBSCRIPTION)
    }

    const { forCalendar } = await getBarberScheduleBookings(barber.id, {
      tablePeriod: "month",
      tableDate: viewDate,
      calendarDate: viewDate,
    })

    return (
      <ScheduleClient
        bookings={JSON.parse(JSON.stringify(forCalendar)) as OwnerBookingRow[]}
        barbers={[]}
        services={[]}
        clients={[]}
        viewDateIso={viewDateIso}
        listDateIso={listDateIso}
        canManage={false}
        defaultMemberId={barber.id}
      />
    )
  }

  const owner = await getOwnerByUserId(user.id)
  if (!owner) return null
  if (!(await hasOwnerSubscriptionAccess(owner.user.email))) {
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

  const organizationIds = owner.organizations.map((b) => b.id)
  const shopResolved = resolveOrganizationIdForAggregate(
    params.organizationId,
    organizationIds,
  )
  const organizationId =
    shopResolved === "all" || shopResolved === null ? null : shopResolved

  const [barbers, services, clients, schedule] = await Promise.all([
    getOwnerBarbers(user.id, organizationId ?? undefined) as Promise<
      OwnerBarberListRow[]
    >,
    getOwnerServices(user.id, organizationId ?? undefined),
    listOrganizationClients(organizationId ? [organizationId] : organizationIds),
    getOwnerScheduleBookings(organizationIds, {
      tablePeriod: "month",
      organizationId,
      memberId: null,
      tableDate: viewDate,
      calendarDate: viewDate,
    }),
  ])

  const barberOptions = barbers.map((b) => ({
    id: b.id,
    name: b.user.name ?? "Barbeiro",
  }))
  const defaultMemberId = barbers.find((b) => b.user.id === user.id)?.id ?? ""

  return (
    <ScheduleClient
      bookings={
        JSON.parse(JSON.stringify(schedule.forCalendar)) as OwnerBookingRow[]
      }
      barbers={barberOptions}
      services={services.map((s) => ({ id: s.id, name: s.name }))}
      clients={clients.map((c) => ({
        id: c.id,
        name: c.phone ? `${c.name} (${c.phone})` : c.name,
      }))}
      viewDateIso={viewDateIso}
      listDateIso={listDateIso}
      canManage
      defaultMemberId={defaultMemberId}
    />
  )
}
