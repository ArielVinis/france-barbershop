import type { AuthUser } from "@/src/lib/auth"
import type { PanelContext } from "@/src/types/panel-context"
import { getBarberForUser } from "./barber-for-user"
import { getBarbershopForOwner } from "./barbershop-for-owner"

type ResolveInput = {
  /** ID da barbearia (query `shopId` no painel) */
  shopId?: string
}

/**
 * Contexto **escopado** para Server Actions, mutações com uma barbearia explícita
 * e loaders/actions **unificadas** (OWNER + BARBER) que ramificam por `ctx.role`.
 *
 * - **OWNER:** exige `shopId` com UUID de uma loja do dono. Valores vazios ou
 *   `all` retornam `null` — visões agregadas resolvem escopo com
 *   `resolveShopIdForAggregate` / dados agregados, não com este helper.
 * - **BARBER:** o `barbershopId` confiável vem do vínculo `User` → `Barber` → loja
 *   (`getBarberForUser`); `shopId` em `input` **não** altera o escopo aqui. A URL
 *   pode ainda trazer `shopId` para paridade com o owner — o chamador deve
 *   validar `shopId === barber.barbershopId` antes de confiar no valor do cliente.
 *
 * Política: `docs/panel-authorization-and-structure.md`.
 */
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
