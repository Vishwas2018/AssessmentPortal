import { motion } from "framer-motion";
import { Crown, Star, Sparkles } from "lucide-react";
import { type SubscriptionStatus } from "@/lib/stripe";

interface PremiumBadgeProps {
  status: SubscriptionStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animate?: boolean;
}

export default function PremiumBadge({
  status,
  size = "md",
  showLabel = true,
  animate = true,
}: PremiumBadgeProps) {
  const isPremium = status === "active" || status === "trialing";
  const isTrialing = status === "trialing";

  if (!isPremium) return null;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 18,
  };

  return (
    <motion.div
      initial={animate ? { scale: 0 } : false}
      animate={animate ? { scale: 1 } : false}
      whileHover={animate ? { scale: 1.05 } : false}
      className={`
        inline-flex items-center space-x-1.5 rounded-full font-bold
        ${sizeClasses[size]}
        ${
          isTrialing
            ? "bg-gradient-to-r from-blue-400 to-cyan-400 text-white"
            : "bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white"
        }
        shadow-lg
      `}
    >
      {/* Icon */}
      <motion.span
        animate={
          animate
            ? {
                rotate: [0, -10, 10, 0],
              }
            : false
        }
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      >
        {isTrialing ? (
          <Star size={iconSizes[size]} fill="currentColor" />
        ) : (
          <Crown size={iconSizes[size]} />
        )}
      </motion.span>

      {/* Label */}
      {showLabel && <span>{isTrialing ? "Trial" : "Premium"}</span>}

      {/* Sparkle effect for premium */}
      {!isTrialing && animate && (
        <motion.span
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Sparkles size={iconSizes[size] - 2} />
        </motion.span>
      )}
    </motion.div>
  );
}

// ============================================
// PREMIUM BADGE INLINE (for headers/names)
// ============================================

export function PremiumBadgeInline({ status }: { status: SubscriptionStatus }) {
  const isPremium = status === "active" || status === "trialing";

  if (!isPremium) return null;

  return (
    <span className="inline-flex items-center ml-2">
      <motion.span
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 4 }}
        className="text-yellow-500"
      >
        <Crown size={16} />
      </motion.span>
    </span>
  );
}

// ============================================
// SUBSCRIPTION STATUS BADGE (for profile/settings)
// ============================================

export function SubscriptionStatusBadge({
  status,
  periodEnd,
  cancelAtPeriodEnd,
}: {
  status: SubscriptionStatus;
  periodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}) {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        if (cancelAtPeriodEnd) {
          return {
            label: "Canceling",
            color: "bg-orange-100 text-orange-700 border-orange-200",
            icon: null,
          };
        }
        return {
          label: "Active",
          color: "bg-green-100 text-green-700 border-green-200",
          icon: <Crown className="w-4 h-4" />,
        };
      case "trialing":
        return {
          label: "Trial",
          color: "bg-blue-100 text-blue-700 border-blue-200",
          icon: <Star className="w-4 h-4" />,
        };
      case "past_due":
        return {
          label: "Past Due",
          color: "bg-red-100 text-red-700 border-red-200",
          icon: null,
        };
      case "canceled":
        return {
          label: "Canceled",
          color: "bg-gray-100 text-gray-600 border-gray-200",
          icon: null,
        };
      default:
        return {
          label: "Free",
          color: "bg-gray-100 text-gray-600 border-gray-200",
          icon: null,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex flex-col items-start space-y-1">
      <span
        className={`
          inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full
          font-semibold text-sm border-2
          ${config.color}
        `}
      >
        {config.icon}
        <span>{config.label}</span>
      </span>

      {periodEnd && (status === "active" || status === "trialing") && (
        <span className="text-xs text-gray-500">
          {cancelAtPeriodEnd ? "Access until " : "Renews "}
          {new Date(periodEnd).toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      )}
    </div>
  );
}
