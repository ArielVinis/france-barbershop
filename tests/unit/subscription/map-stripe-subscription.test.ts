import { describe, it, expect } from "vitest"
import {
  mapStripeSubscriptionToSnapshot,
  resolveStripeCustomerId,
} from "@/src/features/subscription/_lib/map-stripe-subscription"
import { isOwnerSubscriptionAllowed } from "@/src/features/subscription/_lib/subscription-access"
import { buildStripeSubscription } from "@/tests/unit/subscription/_fixtures/stripe"
import type Stripe from "stripe"

describe("mapStripeSubscriptionToSnapshot", () => {
  it("mapeia subscription ativa para snapshot persistível", () => {
    const snapshot = mapStripeSubscriptionToSnapshot(buildStripeSubscription())

    expect(snapshot).toEqual({
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      subscriptionStatus: "active",
      subscriptionCurrentPeriodEnd: new Date(1_700_000_000 * 1000),
    })
  })

  it("resolve customer expandido", () => {
    expect(
      resolveStripeCustomerId({ id: "cus_expanded" } as Stripe.Customer),
    ).toBe("cus_expanded")
  })

  it("marca assinatura cancelada como sem acesso", () => {
    const snapshot = mapStripeSubscriptionToSnapshot(
      buildStripeSubscription({ status: "canceled" }),
    )

    expect(isOwnerSubscriptionAllowed(snapshot.subscriptionStatus)).toBe(false)
  })

  it("mantém acesso para past_due", () => {
    expect(isOwnerSubscriptionAllowed("past_due")).toBe(true)
  })
})
