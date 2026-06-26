import { auth } from "@/src/shared/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { PATHS } from "@/src/shared/constants/PATHS"

function buildLoginRedirect(request: NextRequest, invitationId: string) {
  const acceptUrl = PATHS.API.ACCEPT_INVITATION(invitationId)
  const loginUrl = new URL(PATHS.AUTH.LOGIN, request.url)
  loginUrl.searchParams.set("callbackUrl", acceptUrl)
  return NextResponse.redirect(loginUrl)
}

function buildErrorRedirect(
  request: NextRequest,
  invitationId: string,
  message: string,
) {
  const loginUrl = new URL(PATHS.AUTH.LOGIN, request.url)
  loginUrl.searchParams.set("callbackUrl", PATHS.API.ACCEPT_INVITATION(invitationId))
  loginUrl.searchParams.set("error", message)
  return NextResponse.redirect(loginUrl)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> },
) {
  const { invitationId } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return buildLoginRedirect(request, invitationId)
  }

  try {
    const result = await auth.api.acceptInvitation({
      body: { invitationId },
      headers: await headers(),
    })

    const organizationId = result?.member?.organizationId
    if (organizationId) {
      await auth.api.setActiveOrganization({
        body: { organizationId },
        headers: await headers(),
      })
    }

    const panelUrl = new URL(PATHS.PANEL.ROOT, request.url)
    panelUrl.searchParams.set("welcome", "1")
    return NextResponse.redirect(panelUrl)
  } catch (error) {
    console.error("acceptInvitation", error)
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível aceitar o convite"
    return buildErrorRedirect(request, invitationId, message)
  }
}
