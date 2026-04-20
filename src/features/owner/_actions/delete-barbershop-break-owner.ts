"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/lib/auth"
import { ForbiddenError, NotFoundError, requireBarbershopForOwner } from "@/src/lib/authz"
import { db } from "@/src/lib/prisma"
import { PATHS } from "@/src/constants/PATHS"

export async function deleteBarbershopBreakOwner(breakId: string) {
  const user = await getCurrentUser()

  const row = await db.barbershopBreak.findUnique({
    where: { id: breakId },
    select: { barbershopId: true },
  })
  if (!row) throw new NotFoundError("Pausa não encontrada")

  const shop = await requireBarbershopForOwner(user.id, row.barbershopId).catch(
    (error) => {
      if (error instanceof NotFoundError) {
        throw new ForbiddenError("Você não tem acesso a esta pausa")
      }
      throw error
    },
  )

  await db.barbershopBreak.delete({ where: { id: breakId } })

  revalidatePath(PATHS.PANEL.WORKED_HOURS)
  revalidatePath(PATHS.BARBERSHOP.ROOT(shop.slug))
}
