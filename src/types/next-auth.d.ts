import "next-auth"
import type { AppRole } from "@/src/auth"

declare module "next-auth" {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    user: {
      id: string
      role: AppRole
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
