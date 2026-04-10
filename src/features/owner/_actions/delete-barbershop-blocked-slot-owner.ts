"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { db } from "@/src/lib/prisma"
import { PATHS } from "@/src/constants/PATHS"

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

  revalidatePath(PATHS.PANEL.WORKED_HOURS)
  revalidatePath(PATHS.BARBERSHOP.ROOT(row.barbershop.slug))
}
