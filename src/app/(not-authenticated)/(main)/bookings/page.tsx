import { getServerSession } from "next-auth"
import Header from "../../../components/layout/header"
import { authOptions } from "../../../lib/auth"
import { getConfirmedBookings } from "../../../features/bookings/_data/get-confirmed-bookings"
import { getConcludedBookings } from "../../../features/bookings/_data/get-concluded-bookings"
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
        confirmedBookings={JSON.parse(JSON.stringify(confirmedBookings))}
        concludedBookings={JSON.parse(JSON.stringify(concludedBookings))}
      />
    </>
  )
}

export default Bookings
