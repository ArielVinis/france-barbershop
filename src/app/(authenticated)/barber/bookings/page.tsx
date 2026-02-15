import { getBarberSession } from "@/src/lib/auth"
import { getBarberBookings } from "@/src/features/barber/_data/get-barber-bookings"
import { BarberBookingsClient } from "./barber-bookings-client"

export default async function BarberBookingsPage() {
  const { barberId } = await getBarberSession()
  if (!barberId) throw new Error("Barbeiro não encontrado")

  const today = new Date()
  const [bookingsDay, bookingsWeek, bookingsMonth] = await Promise.all([
    getBarberBookings(barberId, "day", today),
    getBarberBookings(barberId, "week", today),
    getBarberBookings(barberId, "month", today),
  ])

  return (
    <BarberBookingsClient
      bookingsDay={JSON.parse(JSON.stringify(bookingsDay))}
      bookingsWeek={JSON.parse(JSON.stringify(bookingsWeek))}
      bookingsMonth={JSON.parse(JSON.stringify(bookingsMonth))}
    />
  )
}
