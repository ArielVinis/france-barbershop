import {
  mapStripeSubscriptionToSnapshot,
  resolveStripeCustomerId,
} from "@/src/features/subscription/_lib/map-stripe-subscription"
import { isOwnerSubscriptionAllowed } from "@/src/features/subscription/_lib/subscription-access"
import {
  subscriptionRepository,
  subscriptionStripeRepository,
} from "@/src/features/subscription/subscription.repository"
import { stripe } from "@/src/shared/lib/stripe"
import type Stripe from "stripe"

async function resolveUserIdForSubscription(
  subscription: Stripe.Subscription,
  userIdHint?: string | null,
) {
  if (userIdHint) {
    const user = await subscriptionRepository.findUserById(userIdHint)
    if (user) return user.id
  }

  const bySubscription =
    await subscriptionRepository.findUserByStripeSubscriptionId(subscription.id)
  if (bySubscription) return bySubscription.id

  const customerId = resolveStripeCustomerId(subscription.customer)
  if (customerId) {
    const byCustomer =
      await subscriptionRepository.findUserByStripeCustomerId(customerId)
    if (byCustomer) return byCustomer.id
  }

  const metadataUserId = subscription.metadata?.userId
  if (metadataUserId) {
    const user = await subscriptionRepository.findUserById(metadataUserId)
    if (user) return user.id
  }

  if (customerId) {
    const customer = await stripe.customers.retrieve(customerId)
    if (!customer.deleted && customer.email) {
      const byEmail = await subscriptionRepository.findUserSubscriptionByEmail(
        customer.email,
      )
      if (byEmail) return byEmail.id
    }
  }

  return null
}

export const subscriptionService = {
  fetchSubscriptionByEmail(email: string) {
    if (!email) return Promise.resolve(null)
    return subscriptionStripeRepository.findSubscriptionByEmail(email)
  },

  async syncSubscriptionFromStripe(
    subscription: Stripe.Subscription,
    userIdHint?: string | null,
  ) {
    const userId = await resolveUserIdForSubscription(subscription, userIdHint)
    if (!userId) {
      console.warn(
        "[subscription] Unable to resolve user for Stripe subscription",
        subscription.id,
      )
      return null
    }

    return subscriptionRepository.updateUserSubscription(
      userId,
      mapStripeSubscriptionToSnapshot(subscription),
    )
  },

  async handleStripeWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== "subscription") return null

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id

        if (!subscriptionId) return null

        const subscription =
          await subscriptionStripeRepository.retrieveSubscription(
            subscriptionId,
          )
        const userIdHint =
          session.metadata?.userId ?? session.client_reference_id ?? null

        return subscriptionService.syncSubscriptionFromStripe(
          subscription,
          userIdHint,
        )
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        return subscriptionService.syncSubscriptionFromStripe(subscription)
      }

      default:
        return null
    }
  },

  async hasOwnerSubscriptionAccess(email: string | null) {
    if (!email) return false

    const user = await subscriptionRepository.findUserSubscriptionByEmail(email)
    if (user?.subscriptionStatus) {
      return isOwnerSubscriptionAllowed(user.subscriptionStatus)
    }

    const subscription =
      await subscriptionStripeRepository.findSubscriptionByEmail(email)
    if (subscription && user) {
      await subscriptionService.syncSubscriptionFromStripe(
        subscription,
        user.id,
      )
    }

    return isOwnerSubscriptionAllowed(subscription?.status)
  },

  async hasBarbershopSubscriptionAccess(organizationId: string) {
    const shop = await subscriptionRepository.findOwnerEmail(organizationId)
    const email = shop?.members[0]?.user.email ?? null
    return subscriptionService.hasOwnerSubscriptionAccess(email)
  },

  async cancelSubscription(subscriptionId: string) {
    const subscription =
      await subscriptionStripeRepository.cancelSubscription(subscriptionId)
    await subscriptionService.syncSubscriptionFromStripe(subscription)
    return subscription
  },

  async fetchClientSecret(params: {
    origin: string | null
    paymentConfirmationPath: string
    userId: string
    email?: string
  }) {
    const session = await subscriptionStripeRepository.createCheckoutSession({
      priceId: process.env.STRIPE_PRICE_ID,
      returnUrl: (params.origin ?? "") + params.paymentConfirmationPath,
      userId: params.userId,
      email: params.email,
    })

    if (!session.client_secret) {
      throw new Error("Stripe did not return a client secret.")
    }

    return session.client_secret
  },
}
