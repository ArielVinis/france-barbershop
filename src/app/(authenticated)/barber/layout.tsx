import { getCurrentUser } from "@/src/lib/auth"
import { BarberLayoutClient } from "@/src/components/templates/barber/barber-layout-client"
import { getBarberByUserId } from "@/src/features/barber/_data/get-barber-by-user-id"

export default async function BarberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  const barber = await getBarberByUserId(user.id)
  if (!barber) return null

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
