"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { subscriptionService } from "@/src/features/subscription/subscription.service"
import {
  isOwnerSubscriptionAllowed,
  translateSubscriptionInterval,
  translateSubscriptionStatus,
} from "@/src/features/subscription/subscription.repository"
import { PATHS } from "@/src/shared/constants/PATHS"

export async function fetchSubscriptionByEmail(email: string) {
  return subscriptionService.fetchSubscriptionByEmail(email)
}

export { isOwnerSubscriptionAllowed, translateSubscriptionStatus, translateSubscriptionInterval }

export async function fetchClientSecret() {
  const origin = (await headers()).get("origin")
  return subscriptionService.fetchClientSecret(
    origin,
    PATHS.STRIPE.PAYMENT_CONFIRMATION,
  )
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    await subscriptionService.cancelSubscription(subscriptionId)
    revalidatePath(PATHS.PANEL.SUBSCRIPTION)
    return { success: true, message: "Subscription canceled successfully" }
  } catch (error: unknown) {
    return {
      success: false,
      message: "Failed to cancel subscription",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function hasOwnerSubscriptionAccess(email: string | null) {
  return subscriptionService.hasOwnerSubscriptionAccess(email)
}

export async function hasBarbershopSubscriptionAccess(organizationId: string) {
  return subscriptionService.hasBarbershopSubscriptionAccess(organizationId)
}
