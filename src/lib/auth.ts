import { cache } from "react"
import { getServerSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { AuthOptions, Session } from "next-auth"
import { db } from "./prisma"
import { Adapter } from "next-auth/adapters"
import GoogleProvider from "next-auth/providers/google"

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
        role: dbUser?.role ?? "CLIENT",
      } as any
      return session
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
}

/** Usuário autenticado (session.user) com id e role. */
export type AuthUser = NonNullable<Session["user"]>

/**
 * Retorna a sessão completa no servidor (Session | null).
 * Deduplicado por requisição via cache(): várias chamadas na mesma request
 * executam getServerSession só uma vez.
 * Use em: páginas que repassam a sessão ao cliente; data fetchers que usam session.user.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  return getServerSession(authOptions)
})

/**
 * Retorna apenas o usuário atual no servidor (AuthUser | null).
 * Reutiliza a sessão em cache quando getSession() já foi chamado na mesma request.
 * Use em: Server Actions, layouts e páginas que só precisam de user.id, user.role, etc.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession()
  return session?.user ?? null
}
