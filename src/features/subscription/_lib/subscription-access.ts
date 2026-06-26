import type Stripe from "stripe"

const OWNER_ALLOWED_SUBSCRIPTION_STATUSES = new Set<Stripe.Subscription.Status>(
  ["active", "trialing", "past_due"],
)

export function isOwnerSubscriptionAllowed(
  status: Stripe.Subscription.Status | string | null | undefined,
) {
  if (!status) return false
  return OWNER_ALLOWED_SUBSCRIPTION_STATUSES.has(
    status as Stripe.Subscription.Status,
  )
}
