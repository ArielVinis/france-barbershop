import { SidebarInset, SidebarProvider } from "@/src/components/ui/sidebar"
import { AppSidebar } from "@/src/components/templates/Sidebar/app-sidebar"
import { SiteHeader } from "@/src/components/templates/SiteHeader/site-header"
import { PanelShopSelector } from "@/src/components/templates/Panel/panel-shop-selector"
import { getCurrentUser } from "@/src/lib/auth"
import { getOwnerByUserId } from "@/src/features/owner/_data/get-owner-by-user-id"

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const owner = await getOwnerByUserId(user.id)
  if (!owner) return null

  return (
    <SidebarProvider className="h-full !min-h-0">
      <AppSidebar
        variant="inset"
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
                slug: shop.slug,
              }))}
            />
          }
        />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
