import { cache } from "react"
import { db } from "@/src/lib/prisma"

export const getBarberForUser = cache(async (userId: string) => {
  return db.barber.findUnique({
    where: { userId },
    select: { id: true, barbershopId: true },
  })
})
