import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/src/lib/auth"
import { getBarberBookings } from "@/src/features/barber/_data/get-barber-bookings"
import { BarberBookingsClient } from "./barber-bookings-client"

export default async function BarberBookingsPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as
    | { id?: string; role?: string; barberId?: string | null }
    | undefined
  if (!user?.id || user.role !== "BARBER" || !user.barberId) {
    redirect("/")
  }

  const today = new Date()
  const [bookingsDay, bookingsWeek] = await Promise.all([
    getBarberBookings(user.barberId, "day", today),
    getBarberBookings(user.barberId, "week", today),
  ])

  return (
    <BarberBookingsClient
      bookingsDay={JSON.parse(JSON.stringify(bookingsDay))}
      bookingsWeek={JSON.parse(JSON.stringify(bookingsWeek))}
    />
  )
}
