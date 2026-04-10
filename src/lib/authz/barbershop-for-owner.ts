import { db } from "@/src/lib/prisma"

export async function getBarbershopForOwner(
  userId: string,
  barbershopId: string,
) {
  return db.barbershop.findFirst({
    where: {
      id: barbershopId,
      owners: { some: { id: userId } },
    },
    select: { id: true, slug: true },
  })
}
