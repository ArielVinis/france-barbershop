"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"

export async function deleteBarbershopBlockedSlotOwner(slotId: string) {
  const user = await getCurrentUser()

  const row = await db.barbershopBlockedSlot.findFirst({
    where: {
      id: slotId,
      barbershop: { owners: { some: { id: user.id } } },
    },
    include: { barbershop: { select: { slug: true } } },
  })
  if (!row) {
    throw new Error("Bloqueio não encontrado ou sem permissão")
  }

  await db.barbershopBlockedSlot.delete({ where: { id: slotId } })

  revalidatePath("/owner/horarios")
  revalidatePath(`/${row.barbershop.slug}`)
}
