import Link from "next/link"
import { getSession } from "@/src/lib/auth"
import { getOwnerByUserId } from "@/src/features/owner/_data/get-owner-by-user-id"
import { getOwnerBarbers } from "@/src/features/owner/_data/get-owner-barbers"
import { AppSidebar } from "@/src/components/owner/app-sidebar"
import { SiteHeader } from "@/src/components/owner/site-header"
import { SidebarInset, SidebarProvider } from "@/src/components/ui/sidebar"
import { OwnerBarbersClient } from "@/src/components/owner/owner-barbers-client"

export default async function OwnerBarbersPage({
  searchParams,
}: {
  searchParams: Promise<{ barbershop?: string }>
}) {
  const user = await getSession()
  const owner = await getOwnerByUserId(user.id)
  if (!owner) return null

  if (owner.barbershops.length === 0) {
    return (
      <SidebarProvider className="h-full !min-h-0">
        <AppSidebar
          variant="inset"
          user={owner.user}
          barbershops={owner.barbershops}
        />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <div className="max-w-md rounded-lg border bg-card p-6 text-center">
              <h2 className="text-lg font-semibold">
                Nenhuma barbearia vinculada
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Vincule uma barbearia para gerenciar barbeiros.
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
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const params = await searchParams
  const barbershopId =
    params.barbershop &&
    owner.barbershops.some((b) => b.id === params.barbershop)
      ? params.barbershop
      : undefined

  const barbers = await getOwnerBarbers(user.id, barbershopId)

  return (
    <SidebarProvider className="h-full !min-h-0">
      <AppSidebar
        variant="inset"
        user={owner.user}
        barbershops={owner.barbershops}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <OwnerBarbersClient
                barbers={barbers}
                barbershops={owner.barbershops.map((b) => ({
                  id: b.id,
                  name: b.name,
                }))}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
