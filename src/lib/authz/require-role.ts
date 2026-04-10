import type { AuthUser } from "@/src/lib/auth"
import type { Role } from "@/prisma/generated/prisma/client"

export function requireRole(user: AuthUser, allowed: Role[]) {
  const role = user.role as Role
  if (!allowed.includes(role)) {
    throw new Error("Forbidden")
  }
}
