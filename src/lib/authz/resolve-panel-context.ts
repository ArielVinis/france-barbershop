import type { AuthUser } from "@/src/lib/auth"
import type { PanelContext } from "@/src/types/panel-context"
import { getBarberForUser } from "./barber-for-user"
import { getBarbershopForOwner } from "./barbershop-for-owner"

type ResolveInput = {
  barbershopId?: string
}

export async function resolvePanelContext(
  user: AuthUser,
  input: ResolveInput,
): Promise<PanelContext | null> {
  if (user.role === "OWNER") {
    if (!input.barbershopId) return null
    const shop = await getBarbershopForOwner(user.id, input.barbershopId)
    if (!shop) return null
    return { role: "OWNER", userId: user.id, barbershopId: shop.id }
  }

  if (user.role === "BARBER") {
    const barber = await getBarberForUser(user.id)
    if (!barber) return null
    return {
      role: "BARBER",
      userId: user.id,
      barberId: barber.id,
      barbershopId: barber.barbershopId,
    }
  }

  return null
}
