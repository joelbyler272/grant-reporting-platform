import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getStripeClient } from "@/lib/stripe/client"

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single()

  if (!profile?.org_id) {
    return NextResponse.json(
      { error: "No organization found" },
      { status: 400 }
    )
  }

  const orgId = profile.org_id

  // Fetch subscription record
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("org_id", orgId)
    .single()

  const stripe = getStripeClient()
  let stripeCustomerId = subscription?.stripe_customer_id

  // Create Stripe customer if needed
  if (!stripeCustomerId) {
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single()

    const customer = await stripe.customers.create({
      name: org?.name ?? undefined,
      email: user.email,
      metadata: { org_id: orgId },
    })
    stripeCustomerId = customer.id

    // Upsert subscription record with the new customer ID
    await supabase.from("subscriptions").upsert(
      {
        org_id: orgId,
        stripe_customer_id: stripeCustomerId,
        plan: subscription?.plan ?? "free",
        status: subscription?.status ?? "active",
      },
      { onConflict: "org_id" }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID!,
        quantity: 1,
      },
    ],
    customer: stripeCustomerId,
    success_url: `${appUrl}/settings?tab=billing&success=true`,
    cancel_url: `${appUrl}/settings?tab=billing`,
    metadata: { org_id: orgId },
  })

  return NextResponse.json({ url: session.url })
}
