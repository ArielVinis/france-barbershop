import { db } from "@/src/lib/prisma"
import { cache } from "react"
import { getBarbershopsForUser } from "@/src/lib/authz"

export const getOwnerByUserId = cache(async (userId: string) => {
  const userPromise = db.user.findUnique({
    where: { id: userId },
    select: { name: true, image: true, email: true },
  })

  const barbershopsPromise = getBarbershopsForUser(userId)

  const [user, barbershops] = await Promise.all([
    userPromise,
    barbershopsPromise,
  ])

  if (!user) return null

  return { user, barbershops }
})
