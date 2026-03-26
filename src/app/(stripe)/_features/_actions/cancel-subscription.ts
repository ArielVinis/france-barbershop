"use server"

import { stripe } from "@/src/lib/stripe"
import { revalidatePath } from "next/cache"

export async function cancelSubscription(subscriptionId: string) {
  try {
    await stripe.subscriptions.cancel(subscriptionId)

    revalidatePath("/stripe/subscription")

    return { success: true, message: "Subscription canceled successfully" }
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to cancel subscription",
      error: error?.message,
    }
  }
}
