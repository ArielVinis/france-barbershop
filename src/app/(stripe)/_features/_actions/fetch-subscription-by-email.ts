"use server"

import { stripe } from "@/src/lib/stripe"

export async function fetchSubscriptionByEmail(email: string) {
  const customers = await stripe.customers.list({
    limit: 1,
    email: email,
    expand: ["data.subscriptions"],
  })

  if (!customers.data.length && !customers.data[0].subscriptions?.data.length) {
    return null
  }

  const subscription = customers.data[0].subscriptions?.data[0]

  return subscription
}

export function translateSubscriptionStatus(status: string) {
  switch (status) {
    case "active":
      return "Ativo"
    case "canceled":
      return "Cancelado"
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
