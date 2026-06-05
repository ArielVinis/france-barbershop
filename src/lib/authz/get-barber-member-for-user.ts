import { cache } from "react"
import { Role } from "@/prisma/generated/prisma/enums"
import { db } from "@/src/lib/prisma"

export const getBarberMemberForUser = cache(async (userId: string) => {
  return db.member.findFirst({
    where: { userId, role: Role.MEMBER },
    select: { id: true, organizationId: true },
  })
})
