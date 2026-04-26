import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/src/lib/auth"
import { PATHS } from "@/src/constants/PATHS"
import { headers } from "next/headers"

export async function proxy(req: NextRequest) {
  // const { pathname } = req.nextUrl

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // Ajustar para pegar o role do user
  // if (pathname.startsWith(PATHS.PANEL.ROOT)) {
  //   const notAuthorized = new URL(PATHS.NOT_AUTHORIZED, req.url)
  //   if (session?.user.role !== "OWNER" || "BARBER") {
  //     return NextResponse.redirect(notAuthorized)
  //   }
  // }

  if (!session) {
    return NextResponse.redirect(new URL(PATHS.AUTH.LOGIN, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/panel/:path*"],
}
