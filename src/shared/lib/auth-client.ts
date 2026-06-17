import { createAuthClient } from "better-auth/react"
import {
  lastLoginMethodClient,
  organizationClient,
} from "better-auth/client/plugins"

export const authClient = createAuthClient({
  plugins: [organizationClient(), lastLoginMethodClient()],
})

export const { signIn, signUp, signOut, useSession, organization } = authClient
