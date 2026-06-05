"use client"

import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/components/ui/sidebar"
import { PATHS } from "@/src/constants/PATHS"
import Image from "next/image"
import {
  getPanelNavMainForRole,
  type PanelNavRole,
} from "@/src/resources/sidebar-items"
import { NavMain } from "@/src/components/templates/Sidebar/nav-main"
import { NavUser } from "@/src/components/templates/Sidebar/nav-user"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  userRole: PanelNavRole
  user: { name?: string | null; image?: string | null; email?: string | null }
  barbershops: { id: string; name: string; slug: string; imageUrl?: string }[]
}

export function AppSidebar({
  userRole,
  user,
  barbershops,
  ...props
}: AppSidebarProps) {
  const navItems = getPanelNavMainForRole(userRole)
  const brand = barbershops[0]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href={PATHS.ROOT}>
                <Image
                  src={brand?.imageUrl ?? "/logo.png"}
                  alt={brand?.name ?? "France Barber"}
                  width={50}
                  height={50}
                  style={{ width: "auto", height: "auto" }}
                  loading="eager"
                />
                <span className="text-base font-semibold">
                  {brand?.name ?? "France Barber"}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        {barbershops.length > 0 && (
          <div className="px-2 py-2">
            <p className="mb-1 px-2 text-xs font-medium uppercase text-muted-foreground">
              Barbearias
            </p>
            <SidebarMenu>
              {barbershops.map((b) => (
                <SidebarMenuItem key={b.id}>
                  <SidebarMenuButton asChild>
                    <Link href={PATHS.BARBERSHOP.ROOT(b.slug)}>{b.name}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user.name ?? "Usuário",
            email: user.email ?? "",
            image: user.image ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
