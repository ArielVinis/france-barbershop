import { cache } from "react"
import { getServerSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { AuthOptions, Session } from "next-auth"
import { db } from "./prisma"
import { Adapter } from "next-auth/adapters"
import GoogleProvider from "next-auth/providers/google"
import { toAppRole, type AuthContext } from "@/src/auth"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db as any) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      })
      session.user = {
        ...session.user,
        id: user.id,
        role: toAppRole(dbUser?.role),
      }
      return session
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
}

export type AuthUser = NonNullable<Session["user"]>

export const getSession = cache(async (): Promise<Session | null> => {
  return getServerSession(authOptions)
})

export async function getCurrentUser(
  message = "Não autorizado",
): Promise<AuthUser> {
  const session = await getSession()
  const user = session?.user ?? null
  if (!user?.id) throw new Error(message)
  return user
}

export async function getAuthContext(): Promise<AuthContext> {
  const user = await getCurrentUser()
  return {
    userId: user.id,
    role: toAppRole(user.role),
  }
}
