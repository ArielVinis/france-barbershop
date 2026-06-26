import type Stripe from "stripe"

export function buildStripeSubscription(
  overrides: Partial<Stripe.Subscription> = {},
): Stripe.Subscription {
  return {
    id: "sub_123",
    object: "subscription",
    customer: "cus_123",
    status: "active",
    metadata: { userId: "user-1" },
    items: {
      object: "list",
      data: [
        {
          id: "si_123",
          object: "subscription_item",
          current_period_end: 1_700_000_000,
        } as Stripe.SubscriptionItem,
      ],
      has_more: false,
      url: "/v1/subscription_items?subscription=sub_123",
    },
    ...overrides,
  } as Stripe.Subscription
}

export function buildStripeEvent(
  type: Stripe.Event.Type,
  object: Stripe.Event.Data.Object,
): Stripe.Event {
  return {
    id: "evt_123",
    object: "event",
    api_version: "2026-02-25.clover",
    created: 1_700_000_000,
    type,
    data: { object },
    livemode: false,
    pending_webhooks: 0,
    request: null,
  } as Stripe.Event
}
