import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { getBarberByUserId } from "@/src/features/barber/_data/get-barber-by-user-id"
import { BarberLayoutClient } from "@/src/components/barber/barber-layout-client"

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
    <BarberLayoutClient
      user={barber.user}
      barbershop={{
        name: barber.barbershop.name,
        slug: barber.barbershop.slug,
        imageUrl: barber.barbershop.imageUrl ?? "/logo.png",
        schedules: barber.barbershop.schedules,
      }}
    >
      {children}
    </BarberLayoutClient>
  )
}
