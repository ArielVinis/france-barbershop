import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Role } from "@/prisma/generated/prisma/enums"
import { PATHS } from "@/src/shared/constants/PATHS"
import { getCurrentUser } from "../server/auth/users"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const { user } = await getCurrentUser()
  const isPanelRoute =
    pathname.startsWith(PATHS.PANEL.ROOT) ||
    pathname.startsWith(PATHS.DEV.PANEL)

  if (isPanelRoute) {
    const canAccessPanel =
      user.role === Role.OWNER ||
      user.role === Role.MEMBER ||
      user.role === Role.MANAGER
    if (!canAccessPanel) {
      return NextResponse.redirect(PATHS.NOT_AUTHORIZED)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/panel/:path*", "/dev/:path*"],
}
