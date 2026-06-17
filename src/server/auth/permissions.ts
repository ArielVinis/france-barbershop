"use server"

import { auth } from "@/src/shared/lib/auth"
import { headers } from "next/headers"

export const isAdmin = async () => {
  try {
    const { success, error } = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          project: ["read", "create", "update", "delete"],
        },
      },
    })

    if (error) {
      return { success: false, message: error || "Failed to check permissions" }
    }

    return success
  } catch (error) {
    console.error(error)
    return { success: false, message: error || "Failed to check permissions" }
  }
}
