"use server"

import { db } from "@/src/lib/prisma"
import { hasOwnerSubscriptionAccess } from "@/src/features/owner/_data/get-owner-subscription-access"

/**
 * Acesso ao painel alinhado ao plano da barbearia: usa o email do primeiro dono
 * associado à loja (mesma fonte que a assinatura Stripe do dono).
 */
export async function hasBarbershopSubscriptionAccess(
  barbershopId: string,
): Promise<boolean> {
  const shop = await db.barbershop.findUnique({
    where: { id: barbershopId },
    select: { owners: { select: { email: true }, take: 1 } },
  })
  const email = shop?.owners[0]?.email ?? null
  return hasOwnerSubscriptionAccess(email)
}
