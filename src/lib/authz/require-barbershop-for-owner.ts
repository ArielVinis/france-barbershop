import { db } from "@/src/lib/prisma"
import { getBarbershopForUser } from "./get-barbershops-for-user"
import { ForbiddenError, NotFoundError } from "./errors"

export type OwnerBarbershopLookup = { id: string; slug: string }

export async function requireBarbershopForOwner(
  userId: string,
  barbershopId: string,
): Promise<OwnerBarbershopLookup> {
  const existing = await db.barbershop.findUnique({
    where: { id: barbershopId },
    select: { id: true },
  })
  if (!existing) {
    throw new NotFoundError("Barbearia não encontrada")
  }

  const owned = await getBarbershopForUser(userId, barbershopId)
  if (!owned) {
    throw new ForbiddenError("Você não tem acesso a esta barbearia")
  }

  return owned
}
