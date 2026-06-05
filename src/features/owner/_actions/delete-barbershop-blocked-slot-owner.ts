"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/src/server/auth/users"
import { ForbiddenError, NotFoundError, requireOrganizationForOwner } from "@/src/lib/authz"
import { db } from "@/src/lib/prisma"
import { PATHS } from "@/src/constants/PATHS"

export async function deleteBarbershopBlockedSlotOwner(slotId: string) {
  const { user } = await getCurrentUser()

  const row = await db.organizationBlockedSlot.findUnique({
    where: { id: slotId },
    select: { organizationId: true },
  })
  if (!row) throw new NotFoundError("Bloqueio não encontrado")

  const shop = await requireOrganizationForOwner(user.id, row.organizationId).catch(
    (error) => {
      if (error instanceof NotFoundError) {
        throw new ForbiddenError("Você não tem acesso a este bloqueio")
      }
      throw error
    },
  )

  await db.organizationBlockedSlot.delete({ where: { id: slotId } })

  revalidatePath(PATHS.PANEL.WORKED_HOURS)
  revalidatePath(PATHS.BARBERSHOP.ROOT(shop.slug))
}
