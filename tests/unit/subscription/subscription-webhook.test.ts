import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/src/shared/lib/stripe", () => ({
  stripe: {
    customers: {
      retrieve: vi.fn(),
    },
  },
}))

vi.mock("@/src/features/subscription/subscription.repository", () => ({
  subscriptionRepository: {
    findUserById: vi.fn(),
    findUserByStripeSubscriptionId: vi.fn(),
    findUserByStripeCustomerId: vi.fn(),
    findUserSubscriptionByEmail: vi.fn(),
    updateUserSubscription: vi.fn(),
  },
  subscriptionStripeRepository: {
    retrieveSubscription: vi.fn(),
  },
  isOwnerSubscriptionAllowed: vi.fn(),
}))

import { subscriptionService } from "@/src/features/subscription/subscription.service"
import {
  subscriptionRepository,
  subscriptionStripeRepository,
} from "@/src/features/subscription/subscription.repository"
import {
  buildStripeEvent,
  buildStripeSubscription,
} from "@/tests/unit/subscription/_fixtures/stripe"
import type Stripe from "stripe"

describe("subscriptionService.handleStripeWebhookEvent", () => {
  beforeEach(() => {
    vi.mocked(subscriptionRepository.findUserById).mockReset()
    vi.mocked(subscriptionRepository.updateUserSubscription).mockReset()
    vi.mocked(subscriptionStripeRepository.retrieveSubscription).mockReset()
  })

  it("sincroniza checkout.session.completed usando metadata.userId", async () => {
    const subscription = buildStripeSubscription()

    vi.mocked(subscriptionRepository.findUserById).mockResolvedValue({
      id: "user-1",
      email: "owner@test.com",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: null,
      subscriptionCurrentPeriodEnd: null,
    })
    vi.mocked(subscriptionStripeRepository.retrieveSubscription).mockResolvedValue(
      subscription as Awaited<
        ReturnType<typeof subscriptionStripeRepository.retrieveSubscription>
      >,
    )
    vi.mocked(subscriptionRepository.updateUserSubscription).mockResolvedValue({
      id: "user-1",
      email: "owner@test.com",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      subscriptionStatus: "active",
      subscriptionCurrentPeriodEnd: new Date(1_700_000_000 * 1000),
    })

    const event = buildStripeEvent("checkout.session.completed", {
      mode: "subscription",
      subscription: "sub_123",
      metadata: { userId: "user-1" },
    } as unknown as Stripe.Checkout.Session)

    await subscriptionService.handleStripeWebhookEvent(event)

    expect(
      subscriptionStripeRepository.retrieveSubscription,
    ).toHaveBeenCalledWith("sub_123")
    expect(subscriptionRepository.updateUserSubscription).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        stripeSubscriptionId: "sub_123",
        subscriptionStatus: "active",
      }),
    )
  })

  it("sincroniza customer.subscription.updated diretamente", async () => {
    vi.mocked(
      subscriptionRepository.findUserByStripeSubscriptionId,
    ).mockResolvedValue({
      id: "user-1",
      email: "owner@test.com",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      subscriptionStatus: "active",
      subscriptionCurrentPeriodEnd: null,
    })
    vi.mocked(subscriptionRepository.updateUserSubscription).mockResolvedValue({
      id: "user-1",
      email: "owner@test.com",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      subscriptionStatus: "past_due",
      subscriptionCurrentPeriodEnd: null,
    })

    const event = buildStripeEvent(
      "customer.subscription.updated",
      buildStripeSubscription({ status: "past_due", metadata: {} }),
    )

    await subscriptionService.handleStripeWebhookEvent(event)

    expect(subscriptionRepository.updateUserSubscription).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ subscriptionStatus: "past_due" }),
    )
  })
})
