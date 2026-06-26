import type Stripe from "stripe"

export type UserSubscriptionSnapshot = {
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  subscriptionStatus: string | null
  subscriptionCurrentPeriodEnd: Date | null
}

export function resolveStripeCustomerId(
  customer: Stripe.Subscription["customer"],
): string | null {
  if (!customer) return null
  return typeof customer === "string" ? customer : customer.id
}

export function resolveSubscriptionCurrentPeriodEnd(
  subscription: Stripe.Subscription,
): Date | null {
  const periodEnd = subscription.items?.data[0]?.current_period_end
  return periodEnd ? new Date(periodEnd * 1000) : null
}

export function mapStripeSubscriptionToSnapshot(
  subscription: Stripe.Subscription,
): UserSubscriptionSnapshot {
  return {
    stripeCustomerId: resolveStripeCustomerId(subscription.customer),
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    subscriptionCurrentPeriodEnd:
      resolveSubscriptionCurrentPeriodEnd(subscription),
  }
}
