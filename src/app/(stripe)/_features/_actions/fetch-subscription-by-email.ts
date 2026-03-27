"use server"

import { stripe } from "@/src/lib/stripe"
import type Stripe from "stripe"

const OWNER_ALLOWED_SUBSCRIPTION_STATUSES = new Set<Stripe.Subscription.Status>(
  ["active", "trialing", "past_due"],
)

export async function fetchSubscriptionByEmail(email: string) {
  if (!email) return null

  const customers = await stripe.customers.list({
    limit: 1,
    email: email,
    expand: ["data.subscriptions"],
  })

  const customer = customers.data[0]
  if (!customer || !customer.subscriptions?.data.length) {
    return null
  }

  const subscription = customer.subscriptions.data[0]

  return subscription
}

export async function isOwnerSubscriptionAllowed(
  status: Stripe.Subscription.Status | null | undefined,
) {
  if (!status) return false
  return OWNER_ALLOWED_SUBSCRIPTION_STATUSES.has(status)
}

export async function translateSubscriptionStatus(status: string) {
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

export async function translateSubscriptionInterval(interval: string) {
  switch (interval) {
    case "month":
      return "Mensal"
    case "year":
      return "Anual"
    default:
      return interval
  }
}
