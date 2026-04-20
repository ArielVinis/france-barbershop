import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getCurrentUser } from "@/src/lib/auth"
import { PATHS } from "@/src/constants/PATHS"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  let user

  try {
    user = await getCurrentUser()
  } catch {
    const notAuthenticated = new URL(PATHS.NOT_AUTHENTICATED, req.url)
    notAuthenticated.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(notAuthenticated)
  }

  if (pathname.startsWith(PATHS.PANEL.ROOT)) {
    const notAuthorized = new URL(PATHS.NOT_AUTHORIZED, req.url)
    if (user.role !== "OWNER" || "BARBER") {
      return NextResponse.redirect(notAuthorized)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/panel/:path*"],
}
