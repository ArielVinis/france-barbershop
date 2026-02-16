import { redirect } from "next/navigation"
import { getSession } from "@/src/lib/auth"
import { getBarberByUserId } from "@/src/features/barber/_data/get-barber-by-user-id"
import { BarberLayoutClient } from "@/src/components/barber/barber-layout-client"

export default async function BarberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { id: userId } = await getSession()

  const barber = await getBarberByUserId(userId)
  if (!barber) {
    redirect("/")
  }

  const displaySchedules =
    barber.schedules.length > 0 ? barber.schedules : barber.barbershop.schedules

  return (
    <BarberLayoutClient
      user={barber.user}
      barbershop={{
        name: barber.barbershop.name,
        slug: barber.barbershop.slug,
        imageUrl: barber.barbershop.imageUrl ?? "/logo.png",
        schedules: displaySchedules,
      }}
    >
      {children}
    </BarberLayoutClient>
  )
}
