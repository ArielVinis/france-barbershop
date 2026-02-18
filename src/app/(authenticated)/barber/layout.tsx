import { getSession } from "@/src/lib/auth"
import { BarberLayoutClient } from "@/src/components/templates/barber/barber-layout-client"

export default async function BarberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { id: barberId } = await getSession()

  const displaySchedules =
    barberId.schedules.length > 0
      ? barberId.schedules
      : barberId.barbershop.schedules

  return (
    <BarberLayoutClient
      user={barberId.user}
      barbershop={{
        name: barberId.barbershop.name,
        slug: barberId.barbershop.slug,
        imageUrl: barberId.barbershop.imageUrl ?? "/logo.png",
        schedules: displaySchedules,
      }}
    >
      {children}
    </BarberLayoutClient>
  )
}
