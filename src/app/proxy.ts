import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSession } from "./lib/auth"
import { PATHS } from "./constants/PATHS"

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // /owner/* - requer role OWNER (matcher já exclui /dev/owner)
  if (pathname === PATHS.OWNER.HOME) {
    const user = await getSession()
    if (!user?.id) {
      const notAuth = new URL(PATHS.NOT_AUTHENTICATED, req.url)
      notAuth.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(notAuth)
    }
    if (user?.role !== "OWNER") {
      return NextResponse.redirect(new URL(PATHS.NOT_AUTHORIZED, req.url))
    }
  }

  // /barber/* - requer role BARBER
  if (pathname === PATHS.BARBER.HOME) {
    const user = await getSession()
    if (!user?.id) {
      const notAuth = new URL(PATHS.NOT_AUTHENTICATED, req.url)
      notAuth.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(notAuth)
    }
    if (user?.role !== "BARBER") {
      return NextResponse.redirect(new URL(PATHS.NOT_AUTHORIZED, req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/owner/:path*", "/barber/:path*"],
}
