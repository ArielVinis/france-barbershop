import { redirect } from "next/navigation"
import type { AuthUser } from "@/src/lib/auth"
import { PATHS } from "@/src/constants/PATHS"

export function redirectBarberFromOwnerOnlyRoutes(user: AuthUser) {
  if (user.role === "BARBER") redirect(PATHS.PANEL.ROOT)
}
