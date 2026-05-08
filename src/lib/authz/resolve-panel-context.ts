import { Role, User } from "@/prisma/generated/prisma/client"
import { getBarberForUser } from "./get-barber-for-user"
import { getBarbershopForUser } from "./get-barbershops-for-user"
import type { PanelContext } from "@/src/types/panel-context"

type ResolveInput = {
  shopId?: string
}

export async function resolvePanelContext(
  user: User,
  input: ResolveInput,
): Promise<PanelContext | null> {
  if (user.role === Role.OWNER) {
    const raw = input.shopId?.trim()
    if (!raw || raw === "all") return null
    const shop = await getBarbershopForUser(user.id, raw)
    if (!shop) return null
    return { role: Role.OWNER, userId: user.id, barbershopId: shop.id }
  }

  if (user.role === Role.MEMBER) {
    const barber = await getBarberForUser(user.id)
    if (!barber) return null
    return {
      role: Role.MEMBER,
      userId: user.id,
      barberId: barber.id,
      barbershopId: barber.barbershopId,
    }
  }

  return null
}
