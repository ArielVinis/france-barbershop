import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { getBarberByUserId } from "@/app/_features/barber/_data/get-barber-by-user-id"
import { BarberSidebar } from "@/app/_components/barber/barber-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/app/_components/ui/sidebar"

export default async function BarberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/")
  }

  const user = session.user as {
    id?: string
    role?: string
    barberId?: string | null
  }
  if (user.role !== "BARBER" || !user.id) {
    redirect("/")
  }

  const barber = await getBarberByUserId(user.id)
  if (!barber) {
    redirect("/")
  }

  return (
    <SidebarProvider>
      <div className="flex h-full min-h-0 flex-1 overflow-hidden">
        <BarberSidebar
          user={barber.user}
          barbershop={{
            name: barber.barbershop.name,
            schedules: barber.barbershop.schedules,
          }}
        />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger />
            <span className="text-sm font-medium text-muted-foreground">
              Menu
            </span>
          </header>
          <main className="flex-1 overflow-y-auto bg-background p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
