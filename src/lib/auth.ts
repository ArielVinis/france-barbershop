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

/**
 * Retorna o usuário atual no servidor. Nunca retorna null: lança erro se não autenticado.
 * Reutiliza a sessão em cache (getSession) na mesma request.
 *
 * @param message - Mensagem de erro quando não autenticado (default: "Não autorizado")
 */
export async function getCurrentUser(
  message = "Não autorizado",
): Promise<AuthUser> {
  const session = await getSession()
  const user = session?.user ?? null
  if (!user?.id) throw new Error(message)
  return user
}
