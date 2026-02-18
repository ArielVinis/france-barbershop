import { SidebarInset, SidebarProvider } from "@/src/components/ui/sidebar"
import { AppSidebar } from "@/src/components/templates/owner/app-sidebar"
import { SiteHeader } from "@/src/components/templates/SiteHeader/site-header"
import { getSession } from "@/src/lib/auth"
import { getOwnerByUserId } from "@/src/features/owner/_data/get-owner-by-user-id"

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()
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
