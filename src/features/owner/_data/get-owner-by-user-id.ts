import { db } from "@/src/lib/prisma"
import { cache } from "react"

export const getOwnerByUserId = cache(async (userId: string) => {
  const userPromise = db.user.findUnique({
    where: { id: userId },
    select: { name: true, image: true, email: true },
  })

  const barbershopsPromise = db.barbershop.findMany({
    where: {
      owners: { some: { id: userId } },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  })

  const [user, barbershops] = await Promise.all([
    userPromise,
    barbershopsPromise,
  ])

  if (!user) return null

  return { user, barbershops }
})
