import { redirect } from "next/navigation"
import { Role, User } from "@/prisma/generated/prisma/client"
import { PATHS } from "@/src/shared/constants/PATHS"

export function redirectBarberFromOwnerOnlyRoutes(user: User) {
  if (user.role === Role.MEMBER) redirect(PATHS.PANEL.ROOT)
}
