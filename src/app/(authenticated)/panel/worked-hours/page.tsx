import { PanelPage } from "@/src/app/(authenticated)/panel/_components/panel-page"
import { getCurrentUser } from "@/src/server/auth/users"
import { redirect } from "next/navigation"
import { getOwnerByUserId } from "@/src/features/organization/organization.actions"
import { getOwnerOrganizationHours } from "@/src/features/schedule/schedule.panel.actions"
import { OwnerBarbershopHoursClient } from "./used/owner-barbershop-hours-client"
import { hasOwnerSubscriptionAccess } from "@/src/features/subscription/subscription.actions"
import { PATHS } from "@/src/shared/constants/PATHS"
import {
  flattenSearchParams,
  resolveScopedOrganizationIdOrRedirect,
} from "@/src/shared/guards/panel/organization-query"
import { redirectBarberFromOwnerOnlyRoutes } from "@/src/shared/guards/panel/ensure-panel-owner"

export default async function OwnerHorariosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { user } = await getCurrentUser()
  redirectBarberFromOwnerOnlyRoutes(user)
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
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <h1 className="text-xl font-semibold">Nenhuma barbearia vinculada</h1>
        <p className="text-sm text-muted-foreground">
          Vincule uma barbearia para gerenciar horários.
        </p>
      </div>
    )
  }

  const raw = await searchParams
  const flat = flattenSearchParams(raw)
  const ids = owner.organizations.map((b) => b.id)
  const shopId = resolveScopedOrganizationIdOrRedirect(
    flat.organizationId,
    ids,
    PATHS.PANEL.WORKED_HOURS,
    flat,
  )

  const organization = await getOwnerOrganizationHours(user.id, shopId)
  if (!organization) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <h1 className="text-xl font-semibold">Barbearia não encontrada</h1>
      </div>
    )
  }

  return (
    <PanelPage title="Horários" contentClassName="py-0 md:py-0">
      <OwnerBarbershopHoursClient
        key={organization.id}
        organizationId={organization.id}
        organizations={owner.organizations.map((org) => ({
          id: org.id,
          name: org.name,
        }))}
        initialSchedules={organization.schedules}
        initialBreaks={organization.breaks}
        initialBlockedSlots={organization.blockedSlots}
      />
    </PanelPage>
  )
}
