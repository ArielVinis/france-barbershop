import { db } from "@/src/lib/prisma"
import { getOrganizationForOwner } from "./get-organizations-for-owner"
import { ForbiddenError, NotFoundError } from "./errors"

export type OwnerOrganizationLookup = { id: string; slug: string }

export async function requireOrganizationForOwner(
  userId: string,
  organizationId: string,
): Promise<OwnerOrganizationLookup> {
  const existing = await db.organization.findUnique({
    where: { id: organizationId },
    select: { id: true },
  })
  if (!existing) {
    throw new NotFoundError("Barbearia não encontrada")
  }

  const owned = await getOrganizationForOwner(userId, organizationId)
  if (!owned) {
    throw new ForbiddenError("Você não tem acesso a esta barbearia")
  }

  return owned
}
