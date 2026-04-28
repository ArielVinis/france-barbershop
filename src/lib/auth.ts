import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { organization } from "better-auth/plugins"
import { db } from "./prisma"
import { headers } from "next/headers"
import { nextCookies } from "better-auth/next-js"
import { ac, admin, member, myCustomRole, owner } from "./auth/permissions"
import { ResetPasswordEmail } from "../components/emails/reset-password"

// import { resend } from "@/src/lib/resend"
// Passar para a /lib
const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      resend.emails.send({
        from: "noreply@example.com",
        to: user.email,
        subject: "Reset your password",
        react: ResetPasswordEmail({
          userName: user.name,
          resetUrl: url,
        }),
      })
    },
  },

  trustedOrigins: [process.env.BETTER_AUTH_URL as string],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [
    nextCookies(),
    organization({
      ac,
      roles: {
        owner,
        admin,
        member,
        myCustomRole,
      },
      allowUserToCreateOrganization: true,
      invitationExpiresIn: 60 * 60 * 24 * 7,
      invitationLimit: 50,
      cancelPendingInvitationsOnReInvite: true,
      teams: {
        enabled: true,
        maximumTeams: 20,
        maximumMembersPerTeam: 50,
        allowRemovingAllTeams: false,
      },
      sendInvitationEmail: sendOrganizationInviteEmail,
    }),
  ],
})

async function sendOrganizationInviteEmail(data: {
  email: string
  organization: { name: string }
  invitation: { id: string }
  inviter: { user: { name: string } }
}) {
  const acceptUrl = new URL(
    process.env.BETTER_AUTH_INVITATION_ACCEPT_URL ??
      `${process.env.BETTER_AUTH_URL}/organization/invitations/accept`,
  )
  acceptUrl.searchParams.set("invitationId", data.invitation.id)

  const payload = {
    to: data.email,
    subject: `Convite para a barbearia ${data.organization.name}`,
    text: `${data.inviter.user.name} convidou você para entrar na organização ${data.organization.name}. Acesse: ${acceptUrl.toString()}`,
    html: `<p>${data.inviter.user.name} convidou você para entrar na organização <strong>${data.organization.name}</strong>.</p><p><a href="${acceptUrl.toString()}">Aceitar convite</a></p>`,
  }

  if (process.env.BETTER_AUTH_INVITATION_WEBHOOK_URL) {
    await fetch(process.env.BETTER_AUTH_INVITATION_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
    return
  }

  console.info(
    `[better-auth] Convite pronto para envio (${data.email}): ${acceptUrl.toString()}`,
  )
}

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) throw new Error("Faça login para continuar")

  return session.user
}
