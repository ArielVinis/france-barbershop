"use server"

import { Role } from "@/prisma/generated/prisma/enums"
import { db } from "@/src/lib/prisma"
import { hasOwnerSubscriptionAccess } from "@/src/features/owner/_data/get-owner-subscription-access"

/**
 * Acesso ao painel alinhado ao plano da barbearia: usa o email do primeiro dono
 * (Member OWNER na organização da loja).
 */
export async function hasBarbershopSubscriptionAccess(
  organizationId: string,
): Promise<boolean> {
  const shop = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      members: {
        where: { role: Role.OWNER },
        take: 1,
        select: { user: { select: { email: true } } },
      },
    },
  })
  const email = shop?.members[0]?.user.email ?? null
  return hasOwnerSubscriptionAccess(email)
}
