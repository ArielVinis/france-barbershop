import { getSession } from "@/src/lib/auth"
import { getOwnerByUserId } from "@/src/features/owner/_data/get-owner-by-user-id"
import { getOwnerServices } from "@/src/features/owner/_data/get-owner-services"
import { OwnerServicesTable } from "./used/owner-services-table"

export default async function OwnerServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ barbershop?: string }>
}) {
  const user = await getSession()
  const owner = await getOwnerByUserId(user.id)
  if (!owner) return null

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

  const params = await searchParams
  const barbershopId =
    params.barbershop &&
    owner.barbershops.some((b) => b.id === params.barbershop)
      ? params.barbershop
      : undefined

  const services = await getOwnerServices(user.id, barbershopId)

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <OwnerServicesTable
            services={services}
            barbershops={owner.barbershops.map((b) => ({
              id: b.id,
              name: b.name,
            }))}
          />
        </div>
      </div>
    </div>
  )
}
