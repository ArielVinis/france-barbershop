import {
  isOwnerSubscriptionAllowed,
  subscriptionRepository,
  subscriptionStripeRepository,
} from "@/src/features/subscription/subscription.repository"

export const subscriptionService = {
  fetchSubscriptionByEmail(email: string) {
    if (!email) return Promise.resolve(null)
    return subscriptionStripeRepository.findSubscriptionByEmail(email)
  },

  async hasOwnerSubscriptionAccess(email: string | null) {
    if (!email) return false
    const subscription =
      await subscriptionStripeRepository.findSubscriptionByEmail(email)
    return isOwnerSubscriptionAllowed(subscription?.status)
  },

  async hasBarbershopSubscriptionAccess(organizationId: string) {
    const shop = await subscriptionRepository.findOwnerEmail(organizationId)
    const email = shop?.members[0]?.user.email ?? null
    return subscriptionService.hasOwnerSubscriptionAccess(email)
  },

  cancelSubscription(subscriptionId: string) {
    return subscriptionStripeRepository.cancelSubscription(subscriptionId)
  },

  async fetchClientSecret(origin: string | null, paymentConfirmationPath: string) {
    const session = await subscriptionStripeRepository.createCheckoutSession({
      priceId: process.env.STRIPE_PRICE_ID,
      returnUrl: (origin ?? "") + paymentConfirmationPath,
    })

    if (!session.client_secret) {
      throw new Error("Stripe did not return a client secret.")
    }

    return session.client_secret
  },
}
