import { Role } from "@/prisma/generated/prisma/enums"
import { stripe } from "@/src/shared/lib/stripe"
import { db } from "@/src/shared/lib/prisma"
import type { UserSubscriptionSnapshot } from "@/src/features/subscription/_lib/map-stripe-subscription"

const userSubscriptionSelect = {
  id: true,
  email: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  subscriptionStatus: true,
  subscriptionCurrentPeriodEnd: true,
} as const

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

  findUserSubscriptionByEmail(email: string) {
    return db.user.findUnique({
      where: { email },
      select: userSubscriptionSelect,
    })
  },

  findUserById(userId: string) {
    return db.user.findUnique({
      where: { id: userId },
      select: userSubscriptionSelect,
    })
  },

  findUserByStripeCustomerId(stripeCustomerId: string) {
    return db.user.findUnique({
      where: { stripeCustomerId },
      select: userSubscriptionSelect,
    })
  },

  findUserByStripeSubscriptionId(stripeSubscriptionId: string) {
    return db.user.findUnique({
      where: { stripeSubscriptionId },
      select: userSubscriptionSelect,
    })
  },

  updateUserSubscription(userId: string, data: UserSubscriptionSnapshot) {
    return db.user.update({
      where: { id: userId },
      data,
      select: userSubscriptionSelect,
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

  async retrieveSubscription(subscriptionId: string) {
    return stripe.subscriptions.retrieve(subscriptionId)
  },

  async cancelSubscription(subscriptionId: string) {
    return stripe.subscriptions.cancel(subscriptionId)
  },

  async createCheckoutSession(params: {
    priceId: string | undefined
    returnUrl: string
    userId: string
    email?: string
  }) {
    return stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      ui_mode: "embedded",
      customer_email: params.email,
      client_reference_id: params.userId,
      metadata: {
        userId: params.userId,
      },
      subscription_data: {
        metadata: {
          userId: params.userId,
        },
      },
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
