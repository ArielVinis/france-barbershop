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
import { sidebarItems } from "@/src/resources/sidebar-items"
import { NavMain } from "./nav-main"
import { NavSection } from "./nav-section"
import { NavUser } from "./nav-user"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: { name?: string | null; image?: string | null; email?: string | null }
  barbershops: { id: string; name: string; slug: string; imageUrl?: string }[]
}

export function AppSidebar({ user, barbershops, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href={PATHS.HOME}>
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
        <NavMain items={sidebarItems.navMain} />
        {sidebarItems.sections.map((section: any) => (
          <NavSection
            key={section.title}
            title={section.name}
            items={section.items}
          />
        ))}

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
            image: user.image ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
