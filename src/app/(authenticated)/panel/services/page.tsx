import { getCurrentUser } from "@/src/lib/auth"
import { redirect } from "next/navigation"
import { getOwnerByUserId } from "@/src/features/owner/_data/get-owner-by-user-id"
import { getOwnerServices } from "@/src/features/owner/_data/get-owner-services"
import { OwnerServicesTable } from "./used/owner-services-table"
import { hasOwnerSubscriptionAccess } from "@/src/features/owner/_data/get-owner-subscription-access"
import { PATHS } from "@/src/constants/PATHS"
import {
  flattenSearchParams,
  resolveScopedShopIdOrRedirect,
} from "@/src/lib/panel/shop-query"
import { redirectBarberFromOwnerOnlyRoutes } from "@/src/lib/panel/ensure-panel-owner"

export default async function OwnerServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await getCurrentUser()
  redirectBarberFromOwnerOnlyRoutes(user)
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
      <div className="flex flex-1 items-center justify-center">
        <h1 className="text-5xl font-bold capitalize">
          Nenhuma barbearia vinculada
        </h1>
        <p className="text-sm text-muted-foreground">
          Vincule uma barbearia para gerenciar serviços.
        </p>
      </div>
    )
  }

  const raw = await searchParams
  const flat = flattenSearchParams(raw)
  const ids = owner.barbershops.map((b) => b.id)
  const shopId = resolveScopedShopIdOrRedirect(
    flat.shopId,
    ids,
    PATHS.PANEL.SERVICES,
    flat,
  )

  const services = await getOwnerServices(user.id, shopId)

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <OwnerServicesTable
            services={JSON.parse(JSON.stringify(services))}
            barbershops={owner.barbershops.map((b) => ({
              id: b.id,
              name: b.name,
            }))}
            selectedBarbershopId={shopId}
          />
        </div>
      </div>
    </div>
  )
}
