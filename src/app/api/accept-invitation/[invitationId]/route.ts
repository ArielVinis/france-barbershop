import { auth } from "@/src/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { PATHS } from "@/src/constants/PATHS"

export async function GET(
  request: NextRequest,
  { params }: { params: { invitationId: string } },
) {
  const { invitationId } = params

  try {
    await auth.api.acceptInvitation({
      body: { invitationId },
      headers: await headers(),
    })

    return NextResponse.redirect(new URL(PATHS.PANEL.ROOT, request.url))
  } catch (error) {
    console.error(error)
    return NextResponse.redirect(new URL(PATHS.NOT_AUTHENTICATED, request.url))
  }
}
