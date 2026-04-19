import type { AuthUser } from "@/src/lib/auth"
import type { PanelContext } from "@/src/types/panel-context"
import { getBarberForUser } from "./barber-for-user"
import { getBarbershopForOwner } from "./barbershop-for-owner"

type ResolveInput = {
  shopId?: string
}

export async function resolvePanelContext(
  user: AuthUser,
  input: ResolveInput,
): Promise<PanelContext | null> {
  if (user.role === "OWNER") {
    const raw = input.shopId?.trim()
    if (!raw || raw === "all") return null
    const shop = await getBarbershopForOwner(user.id, raw)
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
