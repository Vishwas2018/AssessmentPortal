import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Crown,
  Lock,
  Sparkles,
  ArrowRight,
  Zap,
  Star,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { ROUTES } from "@/data/constants";

interface UpgradePromptProps {
  title?: string;
  message?: string;
  freeExamsLeft?: number;
  variant?: "modal" | "inline" | "banner";
  onClose?: () => void;
}

export default function UpgradePrompt({
  title = "Unlock Premium Content",
  message = "Upgrade to Premium for unlimited access to all exams and features.",
  freeExamsLeft,
  variant = "modal",
  onClose,
}: UpgradePromptProps) {
  if (variant === "banner") {
    return <UpgradeBanner freeExamsLeft={freeExamsLeft} />;
  }

  if (variant === "inline") {
    return <UpgradeInline message={message} />;
  }

  // Modal variant
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/10 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="w-20 h-20 mx-auto mb-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl blur-xl opacity-50" />
            <div className="relative w-full h-full bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Lock className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-black text-white text-center mb-2">
            {title}
          </h2>
          <p className="text-gray-400 text-center mb-6">{message}</p>

          {/* Free exams counter */}
          {freeExamsLeft !== undefined && freeExamsLeft >= 0 && (
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4 mb-6 text-center">
              <p className="text-orange-300 font-semibold">
                {freeExamsLeft === 0 ? (
                  <>
                    <span className="text-2xl">😢</span> You've used all your
                    free exams
                  </>
                ) : (
                  <>
                    You have{" "}
                    <span className="text-xl font-black text-orange-400">
                      {freeExamsLeft}
                    </span>{" "}
                    free exam{freeExamsLeft !== 1 ? "s" : ""} left
                  </>
                )}
              </p>
            </div>
          )}

          {/* Benefits preview */}
          <div className="space-y-3 mb-8">
            {[
              { icon: Zap, text: "Unlimited practice exams" },
              { icon: BookOpen, text: "All NAPLAN & ICAS content" },
              { icon: TrendingUp, text: "Detailed progress analytics" },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <benefit.icon className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="text-gray-300 font-medium">
                  {benefit.text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link to={ROUTES.PRICING}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-black text-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white shadow-lg flex items-center justify-center space-x-2"
              >
                <Crown className="w-5 h-5" />
                <span>Upgrade to Premium</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            {onClose && (
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                Maybe Later
              </button>
            )}
          </div>

          {/* Trial mention */}
          <p className="text-center text-gray-500 text-sm mt-4">
            <Sparkles className="w-4 h-4 inline mr-1" />
            Start with a 7-day free trial
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// UPGRADE BANNER (for top of page)
// ============================================

function UpgradeBanner({ freeExamsLeft }: { freeExamsLeft?: number }) {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 py-3"
    >
      <div className="container-custom">
        <div className="flex items-center justify-center space-x-4 text-white">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5" />
            <span className="font-bold">
              {freeExamsLeft !== undefined && freeExamsLeft <= 2 ? (
                <>Only {freeExamsLeft} free exams left!</>
              ) : (
                <>Unlock unlimited exams with Premium</>
              )}
            </span>
          </div>

          <Link
            to={ROUTES.PRICING}
            className="px-4 py-1.5 bg-white text-orange-600 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors flex items-center space-x-1"
          >
            <span>Upgrade Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// UPGRADE INLINE (for cards/sections)
// ============================================

function UpgradeInline({ message }: { message: string }) {
  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-200 rounded-2xl p-6">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-1">Premium Feature</h3>
          <p className="text-gray-600 text-sm mb-3">{message}</p>
          <Link to={ROUTES.PRICING}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-bold text-sm flex items-center space-x-2"
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade</span>
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PREMIUM LOCK OVERLAY (for locked content)
// ============================================

export function PremiumLockOverlay({
  children,
  isLocked,
}: {
  children: React.ReactNode;
  isLocked: boolean;
}) {
  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl">
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-black text-gray-800 text-lg mb-2">
            Premium Content
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Upgrade to access this feature
          </p>
          <Link to={ROUTES.PRICING}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold text-sm"
            >
              Upgrade Now
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}
