"use server"

import { stripe } from "@/src/lib/stripe"
import { revalidatePath } from "next/cache"
import { PATHS } from "@/src/constants/PATHS"

export async function cancelSubscription(subscriptionId: string) {
  try {
    await stripe.subscriptions.cancel(subscriptionId)

    revalidatePath(PATHS.OWNER.SUBSCRIPTION)

    return { success: true, message: "Subscription canceled successfully" }
  } catch (error: unknown) {
    return {
      success: false,
      message: "Failed to cancel subscription",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
