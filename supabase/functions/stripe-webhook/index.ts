// Supabase Edge Function: stripe-webhook
// Deploy with: supabase functions deploy stripe-webhook

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signatureHeader = req.headers.get("stripe-signature");
  if (!signatureHeader) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!webhookSecret || !stripeKey || !supabaseUrl || !supabaseServiceKey) {
    return new Response("Missing environment variables", { status: 500 });
  }

  const body = await req.text();

  // --------------------------------------------
  // Stripe signature verification (Edge-safe)
  // --------------------------------------------
  const elements = signatureHeader.split(",");
  const timestamp = elements.find((e) => e.startsWith("t="))?.split("=")[1];
  const v1 = elements.find((e) => e.startsWith("v1="))?.split("=")[1];

  if (!timestamp || !v1) {
    return new Response("Invalid Stripe signature header", { status: 400 });
  }

  const encoder = new TextEncoder();
  const payload = `${timestamp}.${body}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const signatureBytes = Uint8Array.from(atob(v1), (c) => c.charCodeAt(0));

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    encoder.encode(payload),
  );

  if (!valid) {
    return new Response("Invalid Stripe signature", { status: 400 });
  }

  // --------------------------------------------
  // Process event
  // --------------------------------------------
  const event = JSON.parse(body);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log(`Stripe webhook received: ${event.type}`);

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(supabase, stripeKey, event.data.object);
      break;

    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(supabase, event.data.object);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(supabase, event.data.object);
      break;

    case "invoice.payment_failed":
      await handlePaymentFailed(supabase, event.data.object);
      break;

    default:
      console.log("Unhandled event type:", event.type);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

// ======================================================
// HANDLER FUNCTIONS
// ======================================================

async function handleCheckoutCompleted(
  supabase: any,
  stripeKey: string,
  session: any,
) {
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  const customerRes = await fetch(
    `https://api.stripe.com/v1/customers/${customerId}`,
    { headers: { Authorization: `Bearer ${stripeKey}` } },
  );
  const customer = await customerRes.json();
  const userId = customer.metadata?.supabase_user_id;

  if (!userId) {
    console.error("No user ID found in customer metadata");
    return;
  }

  const subRes = await fetch(
    `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
    { headers: { Authorization: `Bearer ${stripeKey}` } },
  );
  const subscription = await subRes.json();

  const priceId = subscription.items.data[0]?.price.id;
  const planId = priceId?.includes("yearly") ? "yearly" : "monthly";

  await supabase.from("user_subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    plan_id: planId,
    status: subscription.status,
    current_period_start: new Date(
      subscription.current_period_start * 1000,
    ).toISOString(),
    current_period_end: new Date(
      subscription.current_period_end * 1000,
    ).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  });
}

async function handleSubscriptionUpdated(supabase: any, subscription: any) {
  const customerId = subscription.customer;

  const { data } = await supabase
    .from("user_subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!data) return;

  const priceId = subscription.items.data[0]?.price.id;
  const planId = priceId?.includes("yearly") ? "yearly" : "monthly";

  await supabase
    .from("user_subscriptions")
    .update({
      stripe_subscription_id: subscription.id,
      plan_id: planId,
      status: subscription.status,
      current_period_start: new Date(
        subscription.current_period_start * 1000,
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000,
      ).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", data.user_id);
}

async function handleSubscriptionDeleted(supabase: any, subscription: any) {
  const customerId = subscription.customer;

  const { data } = await supabase
    .from("user_subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!data) return;

  await supabase
    .from("user_subscriptions")
    .update({
      status: "canceled",
      plan_id: "free",
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", data.user_id);
}

async function handlePaymentFailed(supabase: any, invoice: any) {
  const customerId = invoice.customer;

  const { data } = await supabase
    .from("user_subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!data) return;

  await supabase
    .from("user_subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", data.user_id);
}
