"use server"

import { stripe } from "@/src/lib/stripe"
import { headers } from "next/headers"
import { PATHS } from "@/src/constants/PATHS"

export async function fetchClientSecret() {
  const origin = (await headers()).get("origin")

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    ui_mode: "embedded",
    line_items: [
      {
        quantity: 1,
        price: process.env.STRIPE_PRICE_ID,
      },
    ],

    return_url: origin + PATHS.STRIPE.PAYMENT_CONFIRMATION,
  })

  if (!session.client_secret) {
    throw new Error("Stripe did not return a client secret.")
  }

  return session.client_secret
}
