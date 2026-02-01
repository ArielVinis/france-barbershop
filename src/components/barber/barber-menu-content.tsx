"use client"

import Link from "next/link"
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
import { Button } from "@/src/components/ui/button"
import { SheetClose, SheetContent } from "@/src/components/ui/sheet"
import { Separator } from "@/src/components/ui/separator"
import { PATHS } from "@/src/constants/PATHS"
import { cn } from "@/src/lib/utils"

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

type BarberMenuContentProps = {
  user: { name?: string | null; image?: string | null; email?: string | null }
  barbershop: {
    name: string
    slug: string
    schedules: Array<{
      dayOfWeek: number
      startTime: string
      endTime: string
      isActive: boolean
    }>
  }
}

export function BarberMenuContent({
  user,
  barbershop,
}: BarberMenuContentProps) {
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
    <SheetContent className="flex w-[90%] flex-col overflow-y-auto p-0">
      <div className="flex items-center gap-3 border-b p-4 pt-5">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {barbershop.name}
          </p>
        </div>
      </div>

      {activeSchedules.length > 0 && (
        <>
          <div className="px-4 py-3">
            <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
              Horários
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {activeSchedules.map((s) => (
                <li key={s.dayOfWeek} className="flex justify-between gap-2">
                  <span>{DAY_NAMES[s.dayOfWeek]}</span>
                  <span>
                    {s.startTime} – {s.endTime}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <Separator />

      <div className="flex-1 px-2 py-3">
        <p className="mb-2 px-2 text-xs font-medium uppercase text-muted-foreground">
          Menu
        </p>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== PATHS.BARBER.HOME && pathname.startsWith(href))
            return (
              <SheetClose key={href} asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "justify-start gap-2",
                    isActive && "bg-muted font-medium",
                  )}
                  asChild
                >
                  <Link href={href}>
                    <Icon size={18} className="shrink-0" />
                    <span>{label}</span>
                  </Link>
                </Button>
              </SheetClose>
            )
          })}
        </nav>
      </div>

      <Separator />

      <div className="p-2">
        <SheetClose asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => signOut({ callbackUrl: PATHS.HOME })}
          >
            <LogOut size={18} className="shrink-0" />
            <span>Sair</span>
          </Button>
        </SheetClose>
      </div>
    </SheetContent>
  )
}
