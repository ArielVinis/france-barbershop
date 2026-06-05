import { db } from "@/src/lib/prisma"
import { cache } from "react"
import { getOrganizationsForOwner } from "@/src/lib/authz"

export const getOwnerByUserId = cache(async (userId: string) => {
  const userPromise = db.user.findUnique({
    where: { id: userId },
    select: { name: true, image: true, email: true },
  })

  const organizationsPromise = getOrganizationsForOwner(userId)

  const [user, organizations] = await Promise.all([
    userPromise,
    organizationsPromise,
  ])

  if (!user) return null

  return { user, organizations }
})
