import { getServerSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { AuthOptions } from "next-auth"
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
      const barber = await db.barber.findUnique({
        where: { userId: user.id },
        select: { id: true },
      })
      session.user = {
        ...session.user,
        id: user.id,
        role: dbUser?.role ?? "CLIENT",
        barberId: barber?.id ?? null,
      } as any
      return session
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
}

export type BarberSession = { id: string; barberId: string }

export async function getBarberSession(): Promise<BarberSession> {
  const session = await getServerSession(authOptions)
  const user = session?.user as
    | { id?: string; role?: string; barberId?: string | null }
    | undefined
  if (!user?.id || user.role !== "BARBER" || !user.barberId) {
    throw new Error("Não autorizado")
  }
  return { id: user.id, barberId: user.barberId }
}

export type OwnerSession = { id: string }

export async function getOwnerSession(): Promise<OwnerSession> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; role?: string } | undefined
  if (!user?.id || user.role !== "OWNER") {
    throw new Error("Não autorizado")
  }
  return { id: user.id }
}
