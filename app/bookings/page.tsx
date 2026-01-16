import { getServerSession } from "next-auth"
import Header from "../_components/header"
import { authOptions } from "../_lib/auth"
import { getConfirmedBookings } from "../_data/get-confirmed-bookings"
import { getConcludedBookings } from "../_data/get-concluded-bookings"
import BookingsClient from "./bookings-client"

const Bookings = async () => {
  const session = await getServerSession(authOptions)
  const confirmedBookings = await getConfirmedBookings()
  const concludedBookings = await getConcludedBookings()

  return (
    <>
      <Header />
      <BookingsClient
        session={session}
        confirmedBookings={confirmedBookings}
        concludedBookings={concludedBookings}
      />
    </>
  )
}

export default Bookings
