import Header from "@/src/components/layout/header"
import { getSession } from "@/src/lib/auth"
import { getConfirmedBookings } from "@/src/features/bookings/_data/get-confirmed-bookings"
import { getConcludedBookings } from "@/src/features/bookings/_data/get-concluded-bookings"
import BookingsClient from "./bookings-client"

const Bookings = async () => {
  const session = await getSession()
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
