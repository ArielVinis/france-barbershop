"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Avatar, AvatarImage } from "@/app/_components/ui/avatar"
import { Button } from "@/app/_components/ui/button"
import { signOut } from "next-auth/react"
import {
  CalendarDays,
  CalendarRange,
  User,
  LogOut,
  Scissors,
  Star,
} from "lucide-react"
import { cn } from "@/app/_lib/utils"

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
    { href: "/barber", label: "Início", icon: Scissors },
    {
      href: "/barber/bookings",
      label: "Meus agendamentos",
      icon: CalendarDays,
    },
    {
      href: "/barber/settings",
      label: "Configurar agenda",
      icon: CalendarRange,
    },
    { href: "/barber/perfil", label: "Meu perfil", icon: User },
    { href: "/barber/ratings", label: "Avaliações", icon: Star },
  ]

  const activeSchedules = barbershop.schedules.filter((s) => s.isActive)

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="border-b border-border p-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            alt="France Barber"
            src="/logo.png"
            height={24}
            width={120}
            className="h-9 w-auto"
          />
        </Link>
      </div>

      {/* Barbeiro: foto + nome */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {barbershop.name}
            </p>
          </div>
        </div>
      </div>

      {/* Horários configurados */}
      {activeSchedules.length > 0 && (
        <div className="border-b border-border p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Horários
          </p>
          <ul className="space-y-1.5 text-sm">
            {activeSchedules.map((s) => (
              <li key={s.dayOfWeek} className="flex justify-between gap-2">
                <span>{DAY_NAMES[s.dayOfWeek]}</span>
                <span className="text-muted-foreground">
                  {s.startTime} – {s.endTime}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navegação */}
      <nav className="flex-1 space-y-0.5 p-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Button
            key={href}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              pathname === href ||
                (href !== "/barber" && pathname.startsWith(href))
                ? "bg-accent text-accent-foreground"
                : "",
            )}
            asChild
          >
            <Link href={href}>
              <Icon size={18} />
              {label}
            </Link>
          </Button>
        ))}
      </nav>

      {/* Sair */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut size={18} />
          Sair da conta
        </Button>
      </div>
    </aside>
  )
}
