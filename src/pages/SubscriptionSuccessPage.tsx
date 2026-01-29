import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  CheckCircle,
  Crown,
  Sparkles,
  ArrowRight,
  BookOpen,
  Trophy,
  Star,
  Zap,
} from "lucide-react";
import { useAuthStore } from "@/store";
import { fetchUserSubscription } from "@/lib/subscription";
import { ROUTES } from "@/data/constants";

export default function SubscriptionSuccessPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);
  const [subscriptionVerified, setSubscriptionVerified] = useState(false);

  // Fire confetti on mount
  useEffect(() => {
    // Initial burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#fbbf24", "#f97316", "#ec4899", "#8b5cf6", "#06b6d4"],
    });

    // Side bursts
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#fbbf24", "#f97316"],
      });
    }, 200);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#ec4899", "#8b5cf6"],
      });
    }, 400);

    // Continuous celebration
    const interval = setInterval(() => {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x: Math.random(), y: 0.5 },
        colors: ["#fbbf24", "#f97316", "#ec4899"],
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Verify subscription
  useEffect(() => {
    async function verifySubscription() {
      if (!user?.id) {
        setIsVerifying(false);
        return;
      }

      // Give Stripe webhook time to process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const subscription = await fetchUserSubscription(user.id);

      if (
        subscription &&
        (subscription.status === "active" || subscription.status === "trialing")
      ) {
        setSubscriptionVerified(true);
      }

      setIsVerifying(false);
    }

    verifySubscription();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full blur-3xl"
        />

        {/* Floating stars */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 1, 0.2],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <Star
              className="text-yellow-400/50"
              size={10 + Math.random() * 20}
              fill="currentColor"
            />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative z-10 max-w-lg w-full"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="w-24 h-24 mx-auto mb-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-xl opacity-50" />
            <div className="relative w-full h-full bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-full flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                <Crown className="w-12 h-12 text-white" />
              </motion.div>
            </div>

            {/* Sparkles around icon */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="absolute"
                style={{
                  top: `${50 + 45 * Math.sin((angle * Math.PI) / 180)}%`,
                  left: `${50 + 45 * Math.cos((angle * Math.PI) / 180)}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </motion.div>
            ))}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-black text-center text-white mb-3"
          >
            Welcome to Premium! 🎉
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-300 text-center mb-8"
          >
            You now have unlimited access to all exams and features. Let's start
            your learning journey!
          </motion.p>

          {/* Status */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center space-x-2 mb-8"
          >
            {isVerifying ? (
              <div className="flex items-center space-x-2 text-gray-400">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="w-5 h-5" />
                </motion.div>
                <span>Activating your subscription...</span>
              </div>
            ) : subscriptionVerified ? (
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Subscription active!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-yellow-400">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">
                  Almost ready - may take a moment to activate
                </span>
              </div>
            )}
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>Your Premium Benefits</span>
            </h3>
            <ul className="space-y-3">
              {[
                "Unlimited practice exams",
                "All NAPLAN & ICAS content",
                "Detailed analytics & insights",
                "Personalized study plans",
                "Priority support",
              ].map((benefit, i) => (
                <motion.li
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  </div>
                  <span className="text-gray-300">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="space-y-3"
          >
            <Link to={ROUTES.EXAMS}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-black text-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white shadow-lg flex items-center justify-center space-x-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>Start Practicing Now</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            <Link to={ROUTES.DASHBOARD}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl font-bold text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                Go to Dashboard
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Help Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-gray-500 mt-6 text-sm"
        >
          Questions? Contact us at{" "}
          <a
            href="mailto:support@eduassess.com"
            className="text-purple-400 hover:underline"
          >
            support@eduassess.com
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
