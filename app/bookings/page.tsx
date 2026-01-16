import Header from "../_components/header"
import BookingItem from "../_components/booking-item"
import { getConfirmedBookings } from "../_data/get-confirmed-bookings"
import { getConcludedBookings } from "../_data/get-concluded-bookings"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import AuthRequiredDialog from "../_components/auth-required-dialog"

const Bookings = async () => {
  const session = await getServerSession(authOptions)
  const confirmedBookings = await getConfirmedBookings()
  const concludedBookings = await getConcludedBookings()

  return (
    <>
      <Header />
      <AuthRequiredDialog />
      <div className="space-y-3 p-5">
        <h1 className="text-xl font-bold">Agendamentos</h1>
        {!session?.user && (
          <p className="text-gray-400">
            Faça login para ver seus agendamentos.
          </p>
        )}
        {session?.user &&
          confirmedBookings.length === 0 &&
          concludedBookings.length === 0 && (
            <p className="text-gray-400">Você não possui agendamentos.</p>
          )}
        {session?.user && confirmedBookings.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
              Confirmados
            </h2>
            {confirmedBookings.map((booking) => (
              <BookingItem
                key={booking.id}
                booking={JSON.parse(JSON.stringify(booking))}
              />
            ))}
          </>
        )}
        {session?.user && concludedBookings.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
              Finalizados
            </h2>
            {concludedBookings.map((booking) => (
              <BookingItem
                key={booking.id}
                booking={JSON.parse(JSON.stringify(booking))}
              />
            ))}
          </>
        )}
      </div>
    </>
  )
}

export default Bookings
