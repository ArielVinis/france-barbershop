import { Role } from "@/prisma/generated/prisma/enums"
import { stripe } from "@/src/shared/lib/stripe"
import { db } from "@/src/shared/lib/prisma"
import type Stripe from "stripe"

const OWNER_ALLOWED_SUBSCRIPTION_STATUSES = new Set<Stripe.Subscription.Status>(
  ["active", "trialing", "past_due"],
)

export const subscriptionRepository = {
  findOwnerEmail(organizationId: string) {
    return db.organization.findUnique({
      where: { id: organizationId },
      select: {
        members: {
          where: { role: Role.OWNER },
          take: 1,
          select: { user: { select: { email: true } } },
        },
      },
    })
  },
}

export const subscriptionStripeRepository = {
  async findSubscriptionByEmail(email: string) {
    const customers = await stripe.customers.list({
      limit: 1,
      email,
      expand: ["data.subscriptions"],
    })

    const customer = customers.data[0]
    if (!customer || !customer.subscriptions?.data.length) {
      return null
    }

    return customer.subscriptions.data[0]
  },

  async cancelSubscription(subscriptionId: string) {
    return stripe.subscriptions.cancel(subscriptionId)
  },

  async createCheckoutSession(params: {
    priceId: string | undefined
    returnUrl: string
  }) {
    return stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      ui_mode: "embedded",
      line_items: [
        {
          quantity: 1,
          price: params.priceId,
        },
      ],
      return_url: params.returnUrl,
    })
  },
}

export function isOwnerSubscriptionAllowed(
  status: Stripe.Subscription.Status | null | undefined,
) {
  if (!status) return false
  return OWNER_ALLOWED_SUBSCRIPTION_STATUSES.has(status)
}

export function translateSubscriptionStatus(status: string) {
  switch (status) {
    case "active":
      return "Ativo"
    case "trialing":
      return "Em período de teste"
    case "past_due":
      return "Pagamento pendente"
    case "canceled":
      return "Cancelado"
    case "unpaid":
      return "Não pago"
    default:
      return status
  }
}

export function translateSubscriptionInterval(interval: string) {
  switch (interval) {
    case "month":
      return "Mensal"
    case "year":
      return "Anual"
    default:
      return interval
  }
}
