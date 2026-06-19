import { SidebarInset, SidebarProvider } from "@/src/components/ui/sidebar"
import { AppSidebar } from "@/src/components/templates/Sidebar/app-sidebar"
import { SiteHeader } from "@/src/components/templates/SiteHeader/site-header"
import { getCurrentUser } from "@/src/server/auth/users"
import { getOwnerByUserId } from "@/src/features/organization/organization.actions"
import { getBarberByUserId } from "@/src/features/member/member.panel.actions"
import { OrganizationSwitcher } from "@/src/components/auth/organization-switcher"
import { getOrganizations } from "@/src/features/organization/organization.actions"
import { Role } from "@/prisma/generated/prisma/enums"

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await getCurrentUser()
  const organizations = await getOrganizations()

  if (user.role === Role.OWNER || user.role === Role.MANAGER) {
    const owner = await getOwnerByUserId(user.id)
    if (!owner) return null

    const barbershopsForNav = owner.organizations.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      imageUrl: org.logo ?? undefined,
    }))

    return (
      <SidebarProvider className="h-full !min-h-0">
        <AppSidebar
          variant="inset"
          userRole={user.role === Role.MANAGER ? Role.MANAGER : Role.OWNER}
          user={owner.user}
          barbershops={barbershopsForNav}
        />
        <SidebarInset>
          <SiteHeader
            title="Painel interno"
            rightContent={
              <OrganizationSwitcher organizations={organizations} />
            }
          />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (user.role === Role.MEMBER) {
    const barber = await getBarberByUserId(user.id)
    if (!barber) return null

    const barbershops = [
      {
        id: barber.organization.id,
        name: barber.organization.name,
        slug: barber.organization.slug,
        imageUrl: barber.organization.logo ?? undefined,
      },
    ]

    return (
      <SidebarProvider className="h-full !min-h-0">
        <AppSidebar
          variant="inset"
          userRole={Role.MEMBER}
          user={barber.user}
          barbershops={barbershops}
        />
        <SidebarInset>
          <SiteHeader title="Painel do barbeiro" />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return null
}
