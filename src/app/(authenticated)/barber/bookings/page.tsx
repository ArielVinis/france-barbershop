import { getCurrentUser } from "@/src/lib/auth"
import { getBarberBookings } from "@/src/features/barber/_data/get-barber-bookings"
import { BarberBookingsClient } from "./used/barber-bookings-client"

export default async function BarberBookingsPage() {
  const user = await getCurrentUser()
  const today = new Date()

  const [bookingsDay, bookingsWeek, bookingsMonth] = await Promise.all([
    getBarberBookings(user.id, "day", today),
    getBarberBookings(user.id, "week", today),
    getBarberBookings(user.id, "month", today),
  ])

  return (
    <BarberBookingsClient
      bookingsDay={JSON.parse(JSON.stringify(bookingsDay))}
      bookingsWeek={JSON.parse(JSON.stringify(bookingsWeek))}
      bookingsMonth={JSON.parse(JSON.stringify(bookingsMonth))}
    />
  )
}
