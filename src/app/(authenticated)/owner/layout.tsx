import { SidebarInset, SidebarProvider } from "@/src/components/ui/sidebar"
import { AppSidebar } from "@/src/app/(authenticated)/owner/_components/app-sidebar"
import { SiteHeader } from "@/src/components/templates/SiteHeader/site-header"
import { getCurrentUser } from "@/src/lib/auth"
import { getOwnerByUserId } from "@/src/app/(authenticated)/owner/_features/_data/get-owner-by-user-id"

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
        <SiteHeader title="Painel do proprietário" />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
