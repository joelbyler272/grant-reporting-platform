import { NextResponse } from "next/server"
import { getStripeClient } from "@/lib/stripe/client"
import { createServiceRoleClient } from "@/lib/supabase/server"
import type Stripe from "stripe"

export async function POST(request: Request) {
  const stripe = getStripeClient()
  const sig = request.headers.get("stripe-signature")!
  const body = await request.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`Stripe webhook signature verification failed: ${message}`)
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    )
  }

  const supabase = createServiceRoleClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const orgId = session.metadata?.org_id
        if (!orgId) {
          console.error("checkout.session.completed: missing org_id in metadata")
          break
        }

        await supabase
          .from("subscriptions")
          .upsert(
            {
              org_id: orgId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              plan: "pro",
              status: "active",
            },
            { onConflict: "org_id" }
          )
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const status = subscription.status === "active" ? "active" : "past_due"

        // In the dahlia API version, current_period_end lives on subscription items
        const periodEnd = subscription.items?.data?.[0]?.current_period_end
        const updateData: Record<string, string> = { status }
        if (periodEnd) {
          updateData.current_period_end = new Date(
            periodEnd * 1000
          ).toISOString()
        }

        await supabase
          .from("subscriptions")
          .update(updateData)
          .eq("stripe_subscription_id", subscription.id)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        await supabase
          .from("subscriptions")
          .update({
            plan: "free",
            status: "canceled",
          })
          .eq("stripe_subscription_id", subscription.id)
        break
      }

      default:
        // Unhandled event type — acknowledge receipt
        break
    }
  } catch (err) {
    console.error(`Error processing webhook event ${event.type}:`, err)
    // Still return 200 to prevent Stripe from retrying
  }

  return NextResponse.json({ received: true })
}
