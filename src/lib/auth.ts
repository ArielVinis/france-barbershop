import { betterAuth, User } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { organization } from "better-auth/plugins"
import { db } from "./prisma"
import { nextCookies } from "better-auth/next-js"
import { ac, admin, member, myCustomRole, owner } from "./auth/permissions"
import { ResetPasswordEmail } from "../components/emails/reset-password"
import { VerifyEmail } from "../components/emails/verify-email"
import { Resend } from "resend"
import { getActiveOrganization } from "../server/organizations/organizations"

// Passar para a /lib depois
const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const organization = await getActiveOrganization(session.userId)
          return {
            data: {
              ...session,
              activeOrganizationId: organization?.id,
            },
          }
        },
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      await resend.emails.send({
        from: "noreply@francebarber.com",
        to: user.email,
        subject: "Redefina sua senha",
        react: ResetPasswordEmail({
          userName: user.name,
          resetUrl: url,
        }),
      })
    },
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    async sendVerificationEmail({ user, url }: { user: User; url: string }) {
      await resend.emails.send({
        from: "noreply@francebarber.com",
        to: user.email,
        subject: "Verifique seu email",
        react: VerifyEmail({
          userName: user.name,
          verificationUrl: url,
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

      // async sendInvitationEmail(data) {
      //   await resend.emails.send({
      //     from: "noreply@francebarber.com",
      //     to: data.email,
      //     subject: `Convite para a barbearia ${organization.name}`,
      //     react: InvitationEmail({
      //       inviteUrl,
      //       inviterName: data.inviter.user.name,
      //       inviterEmail: data.inviter.user.email,
      //       organizationName: data.organization.name,
      //       role: data.role,
      //       appName: "France Barber",
      //     }),
      //   })
      // },
    }),
  ],
})
