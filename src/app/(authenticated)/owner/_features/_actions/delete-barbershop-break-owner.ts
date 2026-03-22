"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"

export async function deleteBarbershopBreakOwner(breakId: string) {
  const user = await getCurrentUser()

  const row = await db.barbershopBreak.findFirst({
    where: {
      id: breakId,
      barbershop: { owners: { some: { id: user.id } } },
    },
    include: { barbershop: { select: { slug: true } } },
  })
  if (!row) {
    throw new Error("Pausa não encontrada ou sem permissão")
  }

  await db.barbershopBreak.delete({ where: { id: breakId } })

  revalidatePath("/owner/horarios")
  revalidatePath(`/${row.barbershop.slug}`)
}
