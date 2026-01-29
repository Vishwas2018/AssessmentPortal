// Supabase Edge Function: create-checkout-session
// Deploy with: supabase functions deploy create-checkout-session --no-verify-jwt
// ============================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("=== create-checkout-session called ===");

    const { userId, priceId, userEmail, successUrl, cancelUrl } =
      await req.json();

    console.log("Request data:", { userId, priceId, userEmail });

    if (!userId || !priceId || !userEmail) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("Env check - STRIPE_SECRET_KEY exists:", !!stripeKey);
    console.log("Env check - SUPABASE_URL exists:", !!supabaseUrl);
    console.log(
      "Env check - SUPABASE_SERVICE_ROLE_KEY exists:",
      !!supabaseServiceKey,
    );

    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe secret key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase service key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl!, supabaseServiceKey);

    // Check if user already has a Stripe customer ID
    console.log("Checking for existing subscription...");
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (subError && subError.code !== "PGRST116") {
      console.error("Subscription fetch error:", subError);
    }

    let customerId = subscription?.stripe_customer_id;
    console.log("Existing customer ID:", customerId);

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      console.log("Creating new Stripe customer...");
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;
      console.log("Created customer:", customerId);

      // Save customer ID to database
      const { error: upsertError } = await supabase
        .from("user_subscriptions")
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          plan_id: "free",
          status: "free",
        });

      if (upsertError) {
        console.error("Upsert error:", upsertError);
      } else {
        console.log("Saved customer ID to database");
      }
    }

    // Create Stripe Checkout session
    console.log("Creating checkout session...");
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || "http://localhost:5174/subscription/success",
      cancel_url: cancelUrl || "http://localhost:5174/pricing",
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          supabase_user_id: userId,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    console.log("Checkout session created:", session.id);
    console.log("Checkout URL:", session.url);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
