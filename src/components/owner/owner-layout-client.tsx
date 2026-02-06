"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, LogOut } from "lucide-react"
import { Avatar, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { PATHS } from "@/src/constants/PATHS"

type OwnerLayoutClientProps = {
  children: React.ReactNode
  user: { name?: string | null; image?: string | null; email?: string | null }
  barbershops: Array<{ id: string; name: string; slug: string }>
}

export function OwnerLayoutClient({
  children,
  user,
  barbershops,
}: OwnerLayoutClientProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <Card>
        <CardContent className="flex flex-row items-center justify-between p-4">
          <Link href={PATHS.HOME} className="font-semibold">
            France Barbershop
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Painel do dono
            </span>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
            </Avatar>
          </div>
        </CardContent>
      </Card>

      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden p-4">
        <aside className="flex w-52 shrink-0 flex-col gap-1 rounded-lg border bg-card p-2">
          <p className="mb-2 px-2 text-xs font-medium uppercase text-muted-foreground">
            Menu
          </p>
          <Button
            variant={pathname === PATHS.OWNER.HOME ? "secondary" : "ghost"}
            className="justify-start gap-2"
            asChild
          >
            <Link href={PATHS.OWNER.HOME}>
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          </Button>
          {barbershops.length > 0 && (
            <>
              <p className="mb-1 mt-2 px-2 text-xs font-medium uppercase text-muted-foreground">
                Barbearias
              </p>
              {barbershops.map((b) => (
                <Link
                  key={b.id}
                  href={PATHS.BARBERSHOP.HOME(b.slug)}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {b.name}
                </Link>
              ))}
            </>
          )}
          <div className="mt-auto border-t pt-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={() => signOut({ callbackUrl: PATHS.HOME })}
            >
              <LogOut size={18} />
              Sair
            </Button>
          </div>
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
