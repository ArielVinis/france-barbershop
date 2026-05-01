import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PATHS } from "@/src/constants/PATHS"
import { getCurrentUser } from "../server/auth/users"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const { user } = await getCurrentUser()
  // Ajustar para pegar o role do user
  if (pathname.startsWith(PATHS.PANEL.ROOT || PATHS.DEV.PANEL)) {
    if (user.role !== "OWNER" || "BARBER") {
      return NextResponse.redirect(PATHS.NOT_AUTHORIZED)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/panel/:path*", "/dev/:path*"],
}
