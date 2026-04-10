import { getCurrentUser } from "@/src/lib/auth"
import { redirect } from "next/navigation"
import { getOwnerByUserId } from "@/src/features/owner/_data/get-owner-by-user-id"
import { getOwnerBarbershopHours } from "@/src/features/owner/_data/get-owner-barbershop-hours"
import { OwnerBarbershopHoursClient } from "./used/owner-barbershop-hours-client"
import { hasOwnerSubscriptionAccess } from "@/src/features/owner/_data/get-owner-subscription-access"
import { PATHS } from "@/src/constants/PATHS"

export default async function OwnerHorariosPage({
  searchParams,
}: {
  searchParams: Promise<{ barbershop?: string }>
}) {
  const user = await getCurrentUser()
  const owner = await getOwnerByUserId(user.id)
  if (!owner) return null
  const hasSubscriptionAccess = await hasOwnerSubscriptionAccess(
    owner.user.email,
  )
  if (!hasSubscriptionAccess) {
    redirect(PATHS.OWNER.SUBSCRIPTION)
  }

  if (owner.barbershops.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <h1 className="text-xl font-semibold">Nenhuma barbearia vinculada</h1>
        <p className="text-sm text-muted-foreground">
          Vincule uma barbearia para gerenciar horários.
        </p>
      </div>
    )
  }

  const params = await searchParams
  const barbershopId =
    params.barbershop &&
    owner.barbershops.some((b) => b.id === params.barbershop)
      ? params.barbershop
      : owner.barbershops[0].id

  const barbershop = await getOwnerBarbershopHours(user.id, barbershopId)
  if (!barbershop) {
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
          key={barbershop.id}
          barbershopId={barbershop.id}
          barbershops={owner.barbershops.map((b) => ({
            id: b.id,
            name: b.name,
          }))}
          initialSchedules={barbershop.schedules}
          initialBreaks={barbershop.breaks}
          initialBlockedSlots={barbershop.blockedSlots.map((s) => ({
            id: s.id,
            startAt: s.startAt,
            endAt: s.endAt,
            reason: s.reason,
          }))}
        />
      </div>
    </div>
  )
}
