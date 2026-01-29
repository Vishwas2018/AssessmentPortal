import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  Star,
  Loader2,
  ArrowRight,
  Shield,
  Clock,
  Gift,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store";
import {
  SUBSCRIPTION_PLANS,
  formatPrice,
  type SubscriptionPlan,
} from "@/lib/stripe";
import {
  fetchUserSubscription,
  createCheckoutSession,
  getFreeExamsRemaining,
} from "@/lib/subscription";

export default function PricingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [freeExamsLeft, setFreeExamsLeft] = useState<number>(5);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    "year",
  );

  // Fetch user's current subscription
  useEffect(() => {
    async function loadSubscription() {
      if (!user?.id) return;

      const subscription = await fetchUserSubscription(user.id);
      if (subscription) {
        setCurrentPlan(subscription.plan_id);
      }

      const remaining = await getFreeExamsRemaining(user.id);
      setFreeExamsLeft(remaining);
    }

    loadSubscription();
  }, [user?.id]);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan.id === "free") {
      navigate("/exams");
      return;
    }

    if (!isAuthenticated || !user) {
      // Redirect to register with return URL
      navigate("/register?redirect=/pricing");
      return;
    }

    if (currentPlan === plan.id) {
      // Already on this plan
      return;
    }

    setIsLoading(plan.id);

    try {
      const result = await createCheckoutSession(
        user.id,
        plan.stripePriceId,
        user.email || "",
      );

      if ("url" in result) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        console.error("Checkout error:", result.error);
        alert("Failed to start checkout. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setIsLoading(null);
    }
  };

  // Filter plans based on billing interval
  const displayPlans = SUBSCRIPTION_PLANS.filter(
    (plan) => plan.id === "free" || plan.interval === billingInterval,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500 rounded-full blur-3xl"
        />

        {/* Floating stars */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <Star
              className="text-yellow-300/30"
              size={8 + Math.random() * 12}
              fill="currentColor"
            />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 container-custom py-16">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full border border-yellow-400/30 mb-6"
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-300 font-bold">
              Unlock Your Full Potential
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 bg-clip-text text-transparent">
              Learning Path
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Join thousands of Australian students acing their NAPLAN and ICAS
            exams with EduAssess Premium
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white/10 rounded-2xl p-1.5 backdrop-blur-sm">
            <button
              onClick={() => setBillingInterval("month")}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                billingInterval === "month"
                  ? "bg-white text-purple-900"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("year")}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 ${
                billingInterval === "year"
                  ? "bg-white text-purple-900"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <span>Yearly</span>
              <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                Save 33%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Free Exams Counter (for logged in free users) */}
        {isAuthenticated && currentPlan === "free" && freeExamsLeft >= 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-8"
          >
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-4 text-center">
              <p className="text-orange-300 font-bold">
                ⚡ You have{" "}
                <span className="text-2xl text-orange-400">
                  {freeExamsLeft}
                </span>{" "}
                free exam{freeExamsLeft !== 1 ? "s" : ""} remaining
              </p>
              <p className="text-orange-200/70 text-sm mt-1">
                Upgrade to Premium for unlimited access!
              </p>
            </div>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {displayPlans.map((plan, index) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              index={index}
              isCurrentPlan={currentPlan === plan.id}
              isLoading={isLoading === plan.id}
              onSelect={() => handleSelectPlan(plan)}
              billingInterval={billingInterval}
            />
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
            {[
              { icon: Shield, text: "Secure Payment" },
              { icon: Clock, text: "Cancel Anytime" },
              { icon: Gift, text: "7-Day Free Trial" },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex items-center space-x-2 text-gray-400"
              >
                <badge.icon className="w-5 h-5" />
                <span className="font-semibold">{badge.text}</span>
              </div>
            ))}
          </div>

          <p className="text-gray-500 text-sm">
            Trusted by 10,000+ Australian families • Prices in AUD • GST
            inclusive
          </p>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-black text-white text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes! All new Premium subscribers get a 7-day free trial. You won't be charged until the trial ends.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, Mastercard, Amex) through our secure payment partner, Stripe.",
              },
              {
                q: "Can I share my subscription with siblings?",
                a: "The Yearly plan includes family sharing for up to 3 children. Monthly plans are for single users.",
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// PRICING CARD COMPONENT
// ============================================

function PricingCard({
  plan,
  index,
  isCurrentPlan,
  isLoading,
  onSelect,
  billingInterval,
}: {
  plan: SubscriptionPlan;
  index: number;
  isCurrentPlan: boolean;
  isLoading: boolean;
  onSelect: () => void;
  billingInterval: "month" | "year";
}) {
  const isPremium = plan.id !== "free";
  const isPopular = plan.popular;

  // Calculate monthly equivalent for yearly
  const monthlyEquivalent =
    plan.interval === "year" ? Math.round(plan.price / 12) : plan.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative rounded-3xl p-1 ${
        isPopular
          ? "bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500"
          : "bg-white/10"
      }`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg"
          >
            <span className="text-white font-black text-sm flex items-center space-x-1">
              <Crown className="w-4 h-4" />
              <span>MOST POPULAR</span>
            </span>
          </motion.div>
        </div>
      )}

      <div
        className={`h-full rounded-[22px] p-8 ${
          isPopular
            ? "bg-gradient-to-br from-slate-900 to-purple-900"
            : "bg-slate-800/50 backdrop-blur-sm"
        }`}
      >
        {/* Plan Icon */}
        <div
          className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center ${
            isPremium
              ? "bg-gradient-to-br from-yellow-400 to-orange-500"
              : "bg-gray-700"
          }`}
        >
          {isPremium ? (
            <Zap className="w-7 h-7 text-white" />
          ) : (
            <Star className="w-7 h-7 text-gray-400" />
          )}
        </div>

        {/* Plan Name */}
        <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
        <p className="text-gray-400 mb-6">{plan.description}</p>

        {/* Price */}
        <div className="mb-6">
          {plan.price === 0 ? (
            <div className="text-4xl font-black text-white">Free</div>
          ) : (
            <>
              <div className="flex items-baseline space-x-1">
                <span className="text-5xl font-black text-white">
                  {formatPrice(monthlyEquivalent)}
                </span>
                <span className="text-gray-400 font-semibold">/month</span>
              </div>
              {plan.interval === "year" && (
                <p className="text-sm text-gray-500 mt-1">
                  Billed {formatPrice(plan.price)} annually
                </p>
              )}
            </>
          )}
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSelect}
          disabled={isLoading || isCurrentPlan}
          className={`w-full py-4 rounded-xl font-black text-lg mb-8 flex items-center justify-center space-x-2 transition-all ${
            isCurrentPlan
              ? "bg-green-500/20 text-green-400 border-2 border-green-500/50 cursor-default"
              : isPremium
                ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white shadow-lg hover:shadow-xl"
                : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isCurrentPlan ? (
            <>
              <Check className="w-5 h-5" />
              <span>Current Plan</span>
            </>
          ) : (
            <>
              <span>{isPremium ? "Start Free Trial" : "Get Started"}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        {/* Features */}
        <ul className="space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start space-x-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isPremium ? "bg-green-500/20" : "bg-gray-700"
                }`}
              >
                <Check
                  className={`w-3 h-3 ${isPremium ? "text-green-400" : "text-gray-500"}`}
                />
              </div>
              <span
                className={`${isPremium ? "text-gray-300" : "text-gray-500"} font-medium`}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
