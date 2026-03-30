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

  // /owner/* - requer role OWNER (matcher já exclui /dev/owner)
  if (pathname.startsWith(PATHS.OWNER.HOME)) {
    const notAuthorized = new URL(PATHS.NOT_AUTHORIZED, req.url)
    if (user.role !== "OWNER") {
      return NextResponse.redirect(notAuthorized)
    }
  }

  // /barber/* - requer role BARBER
  if (pathname.startsWith(PATHS.BARBER.HOME)) {
    const notAuthorized = new URL(PATHS.NOT_AUTHORIZED, req.url)
    if (user.role !== "BARBER") {
      return NextResponse.redirect(notAuthorized)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/owner/:path*", "/barber/:path*"],
}
