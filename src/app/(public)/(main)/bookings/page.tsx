import Header from "@/src/components/layout/header"
import { auth } from "@/src/shared/lib/auth"
import { getConfirmedBookings } from "@/src/features/booking/booking.actions"
import { getConcludedBookings } from "@/src/features/booking/booking.actions"
import BookingsClient from "./bookings-client"
import { headers } from "next/headers"

const Bookings = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const confirmedBookings = await getConfirmedBookings()
  const concludedBookings = await getConcludedBookings()

  return (
    <>
      <Header />
      <BookingsClient
        session={session}
        confirmedBookings={JSON.parse(JSON.stringify(confirmedBookings))}
        concludedBookings={JSON.parse(JSON.stringify(concludedBookings))}
      />
    </>
  )
}

export default Bookings
