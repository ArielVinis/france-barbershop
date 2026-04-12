import { SidebarInset, SidebarProvider } from "@/src/components/ui/sidebar"
import { AppSidebar } from "@/src/components/templates/Sidebar/app-sidebar"
import { SiteHeader } from "@/src/components/templates/SiteHeader/site-header"
import { PanelShopSelector } from "@/src/components/templates/Panel/panel-shop-selector"
import { getCurrentUser } from "@/src/lib/auth"
import { getOwnerByUserId } from "@/src/features/owner/_data/get-owner-by-user-id"
import { getBarberByUserId } from "@/src/features/barber/_data/get-barber-by-user-id"

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (user.role === "OWNER") {
    const owner = await getOwnerByUserId(user.id)
    if (!owner) return null

    return (
      <SidebarProvider className="h-full !min-h-0">
        <AppSidebar
          variant="inset"
          userRole="OWNER"
          user={owner.user}
          barbershops={owner.barbershops}
        />
        <SidebarInset>
          <SiteHeader
            title="Painel interno"
            rightContent={
              <PanelShopSelector
                barbershops={owner.barbershops.map((shop) => ({
                  id: shop.id,
                  name: shop.name,
                }))}
              />
            }
          />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (user.role === "BARBER") {
    const barber = await getBarberByUserId(user.id)
    if (!barber) return null

    const barbershops = [
      {
        id: barber.barbershop.id,
        name: barber.barbershop.name,
        slug: barber.barbershop.slug,
        imageUrl: barber.barbershop.imageUrl ?? undefined,
      },
    ]

    return (
      <SidebarProvider className="h-full !min-h-0">
        <AppSidebar
          variant="inset"
          userRole="BARBER"
          user={barber.user}
          barbershops={barbershops}
        />
        <SidebarInset>
          <SiteHeader title="Painel do barbeiro" rightContent={null} />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return null
}
