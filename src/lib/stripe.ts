// Stripe configuration and types for EduAssess Platform
// ============================================

// ============================================
// SUBSCRIPTION PLANS
// ============================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  interval: "month" | "year";
  features: string[];
  popular?: boolean;
  stripePriceId: string; // Your Stripe Price ID
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Get started with basic practice",
    price: 0,
    interval: "month",
    stripePriceId: "",
    features: [
      "5 free practice exams",
      "Basic progress tracking",
      "Limited question bank",
      "Community support",
    ],
  },
  {
    id: "monthly",
    name: "Premium Monthly",
    description: "Full access, billed monthly",
    price: 1499, // $14.99
    interval: "month",
    stripePriceId: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || "",
    popular: true,
    features: [
      "Unlimited practice exams",
      "All NAPLAN & ICAS content",
      "Detailed analytics & insights",
      "Personalized study plans",
      "Parent progress reports",
      "Priority email support",
      "No ads",
    ],
  },
  {
    id: "yearly",
    name: "Premium Yearly",
    description: "Best value - save 33%",
    price: 11999, // $119.99 (effectively $10/month)
    interval: "year",
    stripePriceId: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID || "",
    features: [
      "Everything in Monthly, plus:",
      "2 months FREE",
      "Early access to new features",
      "Downloadable practice sheets",
      "Priority support",
      "Family sharing (up to 3 kids)",
    ],
  },
];

// ============================================
// SUBSCRIPTION STATUS TYPES
// ============================================

export type SubscriptionStatus =
  | "free"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid";

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(cents / 100);
}

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId);
}

export function isPremiumUser(subscription: UserSubscription | null): boolean {
  if (!subscription) return false;
  return subscription.status === "active" || subscription.status === "trialing";
}

export function getSubscriptionBadge(status: SubscriptionStatus): {
  text: string;
  color: string;
} {
  switch (status) {
    case "active":
      return {
        text: "Premium",
        color: "bg-gradient-to-r from-yellow-400 to-orange-500",
      };
    case "trialing":
      return {
        text: "Trial",
        color: "bg-gradient-to-r from-blue-400 to-cyan-500",
      };
    case "past_due":
      return { text: "Past Due", color: "bg-red-500" };
    case "canceled":
      return { text: "Canceled", color: "bg-gray-500" };
    default:
      return { text: "Free", color: "bg-gray-400" };
  }
}

// ============================================
// STRIPE CONFIG
// ============================================

export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
  // Webhook endpoints (for reference - these run on your backend)
  webhookEndpoint: "/api/stripe/webhook",
  // Success/Cancel URLs
  successUrl: `${window.location.origin}/subscription/success`,
  cancelUrl: `${window.location.origin}/pricing`,
};
