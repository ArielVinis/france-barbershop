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
