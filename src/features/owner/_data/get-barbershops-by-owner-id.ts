import { db } from "@/src/lib/prisma"

export async function getBarbershopsByOwnerId(userId: string) {
  return db.barbershop.findMany({
    where: {
      owners: {
        some: { id: userId },
      },
    },
    orderBy: { name: "asc" },
  })
}
