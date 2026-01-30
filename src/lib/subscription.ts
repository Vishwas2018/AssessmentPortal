// Subscription service - manages user subscriptions via Supabase
// ============================================

import { supabase } from "./supabase";
import {
  type UserSubscription,
  type SubscriptionStatus,
  STRIPE_CONFIG,
} from "./stripe";

// ============================================
// FETCH USER SUBSCRIPTION
// ============================================

export async function fetchUserSubscription(
  userId: string,
): Promise<UserSubscription | null> {
  try {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      // No subscription found - user is on free plan
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching subscription:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error in fetchUserSubscription:", err);
    return null;
  }
}

// ============================================
// CREATE CHECKOUT SESSION
// ============================================

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  userEmail: string,
): Promise<{ url: string } | { error: string }> {
  try {
    // Call Supabase Edge Function to create Stripe checkout session
    const { data, error } = await supabase.functions.invoke(
      "create-checkout-session",
      {
        body: {
          userId,
          priceId,
          userEmail,
          successUrl: STRIPE_CONFIG.successUrl,
          cancelUrl: STRIPE_CONFIG.cancelUrl,
        },
      },
    );

    if (error) {
      console.error("Checkout session error:", error);
      return { error: "Failed to create checkout session" };
    }

    if (!data?.url) {
      return { error: "No checkout URL returned" };
    }

    return { url: data.url };
  } catch (err) {
    console.error("Error creating checkout session:", err);
    return { error: "An unexpected error occurred" };
  }
}

// ============================================
// CREATE CUSTOMER PORTAL SESSION
// ============================================

export async function createPortalSession(
  userId: string,
): Promise<{ url: string } | { error: string }> {
  try {
    // Call Supabase Edge Function to create Stripe portal session
    const { data, error } = await supabase.functions.invoke(
      "create-portal-session",
      {
        body: {
          userId,
          returnUrl: `${window.location.origin}/profile`,
        },
      },
    );

    if (error) {
      console.error("Portal session error:", error);
      return { error: "Failed to create portal session" };
    }

    if (!data?.url) {
      return { error: "No portal URL returned" };
    }

    return { url: data.url };
  } catch (err) {
    console.error("Error creating portal session:", err);
    return { error: "An unexpected error occurred" };
  }
}

// ============================================
// CANCEL SUBSCRIPTION
// ============================================

export async function cancelSubscription(
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke(
      "cancel-subscription",
      {
        body: { userId },
      },
    );

    if (error) {
      console.error("Cancel subscription error:", error);
      return { success: false, error: "Failed to cancel subscription" };
    }

    return { success: true };
  } catch (err) {
    console.error("Error canceling subscription:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================
// CHECK PREMIUM ACCESS
// ============================================

export async function checkPremiumAccess(userId: string): Promise<boolean> {
  const subscription = await fetchUserSubscription(userId);

  if (!subscription) return false;

  return subscription.status === "active" || subscription.status === "trialing";
}

// ============================================
// CHECK EXAM ACCESS
// ============================================

export async function checkExamAccess(
  userId: string,
  examId: string,
): Promise<{ hasAccess: boolean; reason?: string }> {
  try {
    // First check if user has premium
    const isPremium = await checkPremiumAccess(userId);
    if (isPremium) {
      return { hasAccess: true };
    }

    // Check if exam is free
    const { data: exam, error } = await supabase
      .from("exams")
      .select("is_free")
      .eq("id", examId)
      .single<{ is_free: boolean }>();

    if (error) {
      console.error("Error checking exam access:", error);
      return { hasAccess: false, reason: "Could not verify exam access" };
    }

    if (exam?.is_free) {
      return { hasAccess: true };
    }

    // Check if user has taken less than 5 free exams
    const { count, error: countError } = await supabase
      .from("exam_attempts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      console.error("Error counting attempts:", countError);
      return { hasAccess: false, reason: "Could not verify exam access" };
    }

    const FREE_EXAM_LIMIT = 5;
    if ((count || 0) < FREE_EXAM_LIMIT) {
      return { hasAccess: true };
    }

    return {
      hasAccess: false,
      reason: `You've used all ${FREE_EXAM_LIMIT} free exams. Upgrade to Premium for unlimited access!`,
    };
  } catch (err) {
    console.error("Error in checkExamAccess:", err);
    return { hasAccess: false, reason: "An error occurred" };
  }
}

// ============================================
// GET FREE EXAMS REMAINING
// ============================================

export async function getFreeExamsRemaining(userId: string): Promise<number> {
  try {
    const isPremium = await checkPremiumAccess(userId);
    if (isPremium) {
      return -1; // Unlimited
    }

    const { count, error } = await supabase
      .from("exam_attempts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      console.error("Error counting attempts:", error);
      return 0;
    }

    const FREE_EXAM_LIMIT = 5;
    return Math.max(0, FREE_EXAM_LIMIT - (count || 0));
  } catch (err) {
    console.error("Error in getFreeExamsRemaining:", err);
    return 0;
  }
}
