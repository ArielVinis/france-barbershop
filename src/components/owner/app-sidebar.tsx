"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboardIcon } from "lucide-react"
import { NavUser } from "@/src/components/owner/nav-user"
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

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: { name?: string | null; image?: string | null; email?: string | null }
  barbershops: { id: string; name: string; slug: string; imageUrl?: string }[]
}

export function AppSidebar({ user, barbershops, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link
                href={PATHS.BARBERSHOP.HOME(barbershops[0]?.slug ?? PATHS.HOME)}
              >
                <Image
                  src={barbershops[0].imageUrl ?? "/logo.png"}
                  alt={barbershops[0].name}
                  width={50}
                  height={50}
                  style={{ width: "auto", height: "auto" }}
                />
                <span className="text-base font-semibold">
                  {barbershops[0].name ?? "France Barber"}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === PATHS.OWNER.HOME}>
              <Link href={PATHS.OWNER.HOME}>
                <LayoutDashboardIcon />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {barbershops.length > 0 && (
          <div className="px-2 py-2">
            <p className="mb-1 px-2 text-xs font-medium uppercase text-muted-foreground">
              Barbearias
            </p>
            <SidebarMenu>
              {barbershops.map((b) => (
                <SidebarMenuItem key={b.id}>
                  <SidebarMenuButton asChild>
                    <Link href={PATHS.BARBERSHOP.HOME(b.slug)}>{b.name}</Link>
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
            avatar: user.image ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
