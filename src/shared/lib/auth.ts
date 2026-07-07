import { betterAuth, User } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { lastLoginMethod, organization } from "better-auth/plugins"
import { db } from "./prisma"
import { nextCookies } from "better-auth/next-js"
import { ac, ADMIN, OWNER, MANAGER, MEMBER, CLIENT } from "./permissions"
import { OrganizationInvitationEmail } from "@/src/components/emails/organization-invitation"
import { ResetPasswordEmail } from "@/src/components/emails/reset-password"
import { VerifyEmail } from "@/src/components/emails/verify-email"
import { ChangeEmailVerificationEmail } from "@/src/components/emails/change-email-verification"
import { Resend } from "resend"
import { organizationService } from "@/src/features/organization/organization.service"
import { memberService } from "@/src/features/member/member.service"
import { PATHS } from "@/src/shared/constants/PATHS"

const baseUrl = process.env.BETTER_AUTH_URL as string
const invitationAcceptUrl = (invitationId: string) =>
  `${baseUrl}${PATHS.API.ACCEPT_INVITATION(invitationId)}`

// Passar para a /lib depois
const resend = new Resend(process.env.RESEND_API_KEY)
const emailNoReply = process.env.EMAIL_NO_REPLY as string

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  trustedOrigins: [baseUrl],

  user: {
    changeEmail: {
      enabled: true,
    },
  },

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const organization = await organizationService.getActiveOrganization(
            session.userId,
          )
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
      void resend.emails.send({
        from: emailNoReply,
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
      const isChangeEmail = user.emailVerified

      void resend.emails.send({
        from: emailNoReply,
        to: user.email,
        subject: isChangeEmail
          ? "Verifique seu novo e-mail"
          : "Verifique seu email",
        react: isChangeEmail
          ? ChangeEmailVerificationEmail({
              userName: user.name,
              verificationUrl: url,
            })
          : VerifyEmail({
              userName: user.name,
              verificationUrl: url,
            }),
      })
    },
  },

  plugins: [
    lastLoginMethod(),
    nextCookies(),

    organization({
      ac,
      roles: {
        ADMIN,
        OWNER,
        MANAGER,
        MEMBER,
        CLIENT,
      },
      organizationHooks: {
        beforeAcceptInvitation: async ({ invitation, user }) => {
          await memberService.validateInvitationAcceptance(
            invitation.organizationId,
            user.id,
            invitation.role,
          )
        },
        afterAcceptInvitation: async ({ invitation, user }) => {
          await memberService.finalizeMemberAfterInvitation(
            user.id,
            invitation.role,
          )
        },
      },
      async sendInvitationEmail(data) {
        const inviteUrl = invitationAcceptUrl(data.id)
        await resend.emails.send({
          from: emailNoReply,
          to: data.email,
          subject: `Convite para a barbearia ${data.organization.name}`,
          react: OrganizationInvitationEmail({
            inviteUrl,
            inviterName: data.inviter.user.name,
            inviterEmail: data.inviter.user.email,
            organizationName: data.organization.name,
            role: data.role,
          }),
        })
      },
    }),
  ],
})
