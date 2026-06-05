import { getCurrentUser } from "@/src/server/auth/users"
import { redirect } from "next/navigation"
import { getOwnerByUserId } from "@/src/features/owner/_data/get-owner-by-user-id"
import { getOwnerOrganizationHours } from "@/src/features/owner/_data/get-owner-organization-hours"
import { OwnerBarbershopHoursClient } from "./used/owner-barbershop-hours-client"
import { hasOwnerSubscriptionAccess } from "@/src/features/owner/_data/get-owner-subscription-access"
import { PATHS } from "@/src/constants/PATHS"
import {
  flattenSearchParams,
  resolveScopedOrganizationIdOrRedirect,
} from "@/src/lib/panel/organization-query"
import { redirectBarberFromOwnerOnlyRoutes } from "@/src/lib/panel/ensure-panel-owner"

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
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
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
      </div>
    </div>
  )
}
