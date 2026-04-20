"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { ForbiddenError, NotFoundError, requireBarbershopForOwner } from "@/src/lib/authz"
import { db } from "@/src/lib/prisma"
import { PATHS } from "@/src/constants/PATHS"

export async function deleteBarbershopBlockedSlotOwner(slotId: string) {
  const user = await getCurrentUser()

  const row = await db.barbershopBlockedSlot.findUnique({
    where: { id: slotId },
    select: { barbershopId: true },
  })
  if (!row) throw new NotFoundError("Bloqueio não encontrado")

  const shop = await requireBarbershopForOwner(user.id, row.barbershopId).catch(
    (error) => {
      if (error instanceof NotFoundError) {
        throw new ForbiddenError("Você não tem acesso a este bloqueio")
      }
      throw error
    },
  )

  await db.barbershopBlockedSlot.delete({ where: { id: slotId } })

  revalidatePath(PATHS.PANEL.WORKED_HOURS)
  revalidatePath(PATHS.BARBERSHOP.ROOT(shop.slug))
}
