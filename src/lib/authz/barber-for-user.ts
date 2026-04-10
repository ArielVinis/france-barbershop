import { cache } from "react"
import { db } from "@/src/lib/prisma"

/**
 * Nome canônico de autorização (camada authz).
 * Resolve o registro Barber a partir do User.id autenticado.
 */
export const getBarberForUser = cache(async (userId: string) => {
  return db.barber.findUnique({
    where: { userId },
    select: { id: true, barbershopId: true },
  })
})
