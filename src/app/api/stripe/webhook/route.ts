import { subscriptionService } from "@/src/features/subscription/subscription.service"
import { stripe } from "@/src/shared/lib/stripe"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set")
    return NextResponse.json(
      { error: "Webhook secret is not configured" },
      { status: 500 },
    )
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    )
  }

  const body = await request.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature"
    console.error("[stripe/webhook] Signature verification failed:", message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    await subscriptionService.handleStripeWebhookEvent(event)
  } catch (error) {
    console.error("[stripe/webhook] Handler failed:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    )
  }

  return NextResponse.json({ received: true })
}
