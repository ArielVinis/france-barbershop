import { getCurrentUser } from "@/src/lib/auth"
import { getBarberByUserId } from "./get-barber-by-user-id"

/**
 * Resolve o registro Barber do usuário logado.
 * O `id` da sessão é User.id; Booking e demais tabelas usam Barber.id.
 */
export async function requireBarberForSession() {
  const user = await getCurrentUser()
  const barber = await getBarberByUserId(user.id)
  if (!barber) {
    throw new Error("Barbeiro não encontrado")
  }
  return barber
}
