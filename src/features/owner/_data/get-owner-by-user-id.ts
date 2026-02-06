import { db } from "@/src/lib/prisma"

export async function getOwnerByUserId(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, image: true, email: true },
  })
  if (!user) return null

  const barbershops = await db.barbershop.findMany({
    where: {
      owners: { some: { id: userId } },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  })

  return { user, barbershops }
}
