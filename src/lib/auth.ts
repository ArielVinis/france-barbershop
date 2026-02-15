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

export async function getSession(): Promise<any> {
  const session = await getServerSession(authOptions)
  const user = session?.user as {
    id: string
    role: string
    name: string
    email: string
    image: string
    phone: string
  }

  return user
}
