import { getCurrentUser } from "@/src/server/auth/users"
import { getBarberMemberForUser } from "./get-barber-member-for-user"

/**
 * Resolve o Member (barbeiro) do usuário logado.
 * O `id` retornado é Member.id, usado em Booking.memberId.
 */
export async function requireBarberForSession() {
  const { user } = await getCurrentUser()
  const barber = await getBarberMemberForUser(user.id)
  if (!barber) {
    throw new Error("Barbeiro não encontrado")
  }
  return barber
}
