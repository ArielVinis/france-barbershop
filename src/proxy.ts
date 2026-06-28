import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { Role } from "@/prisma/generated/prisma/enums"
import { PATHS } from "@/src/shared/constants/PATHS"
import { auth } from "@/src/shared/lib/auth"
import { db } from "@/src/shared/lib/prisma"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const session = await auth.api.getSession({
    headers: req.headers,
  })

  if (!session) {
    const loginUrl = new URL(PATHS.AUTH.LOGIN, req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user) {
    return NextResponse.redirect(new URL(PATHS.AUTH.LOGIN, req.url))
  }

  const canAccessPanel =
    user.role === Role.OWNER ||
    user.role === Role.MEMBER ||
    user.role === Role.MANAGER

  if (!canAccessPanel) {
    return NextResponse.redirect(new URL(PATHS.NOT_AUTHORIZED, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/panel/:path*"],
}
