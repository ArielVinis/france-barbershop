"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Avatar, AvatarImage } from "@/src/components/ui/avatar"
import { signOut } from "next-auth/react"
import {
  CalendarDays,
  CalendarRange,
  User,
  LogOut,
  Scissors,
  Star,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/src/components/ui/sidebar"
import { PATHS } from "@/src/constants/PATHS"

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

type BarberSidebarProps = {
  user: { name?: string | null; image?: string | null; email?: string | null }
  barbershop: {
    name: string
    schedules: Array<{
      dayOfWeek: number
      startTime: string
      endTime: string
      isActive: boolean
    }>
  }
}

export function BarberSidebar({ user, barbershop }: BarberSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: PATHS.BARBER.HOME, label: "Início", icon: Scissors },
    {
      href: PATHS.BARBER.BOOKINGS,
      label: "Meus agendamentos",
      icon: CalendarDays,
    },
    { href: PATHS.BARBER.SETTINGS, label: "Minha agenda", icon: CalendarRange },
    { href: PATHS.BARBER.PROFILE, label: "Meu perfil", icon: User },
    { href: PATHS.BARBER.RATINGS, label: "Avaliações", icon: Star },
  ]

  const activeSchedules = barbershop.schedules.filter((s) => s.isActive)

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={PATHS.HOME} className="flex items-center gap-2">
                <Image
                  alt="France Barber"
                  src="/logo.png"
                  height={24}
                  width={120}
                  className="h-auto w-auto"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[active=true]:bg-transparent"
              asChild
            >
              <div className="flex w-full items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-sidebar-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground/70">
                    {barbershop.name}
                  </p>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {activeSchedules.length > 0 && (
        <>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Horários</SidebarGroupLabel>
            <SidebarGroupContent>
              <ul className="space-y-1.5 px-2 text-sm text-sidebar-foreground/80">
                {activeSchedules.map((s) => (
                  <li key={s.dayOfWeek} className="flex justify-between gap-2">
                    <span>{DAY_NAMES[s.dayOfWeek]}</span>
                    <span>
                      {s.startTime} – {s.endTime}
                    </span>
                  </li>
                ))}
              </ul>
            </SidebarGroupContent>
          </SidebarGroup>
        </>
      )}

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href ||
                  (href !== PATHS.BARBER.HOME && pathname.startsWith(href))
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={href}>
                        <Icon size={18} className="shrink-0" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: PATHS.HOME })}
              className="text-sidebar-foreground/80"
            >
              <LogOut size={18} className="shrink-0" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
