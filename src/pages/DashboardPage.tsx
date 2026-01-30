import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/data/constants";
import { formatDate } from "@/utils/helpers";
import {
  fetchDashboardData,
  type DashboardData,
  type RecentAttemptWithExam,
} from "@/lib/dashboard";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  TrendingDown,
  Star,
  Sparkles,
  Trophy,
  Target,
  Zap,
  Flame,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user, profile } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get display name from profile or user metadata
  const displayName =
    profile?.display_name ||
    profile?.full_name?.split(" ")[0] ||
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Student";

  // Fetch dashboard data
  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchDashboardData(user.id);
        setDashboardData(data);

        if (data.error) {
          setError(data.error);
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [user?.id]);

  // Refresh function
  const handleRefresh = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardData(user.id);
      setDashboardData(data);
    } catch (err) {
      setError("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container-custom py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
              <p className="text-2xl font-bold text-gray-600">
                Loading your dashboard...
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container-custom py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-md"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">Oops!</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-6 py-3 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors flex items-center space-x-2 mx-auto"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalExamsTaken: 0,
    completedExams: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
    improvementPercentage: 0,
  };

  const recentAttempts = dashboardData?.recentAttempts || [];
  const strongTopics = dashboardData?.strongTopics || [];
  const weakTopics = dashboardData?.weakTopics || [];

  // Check if user has any data
  const hasData = stats.totalExamsTaken > 0;

  // Format time display
  const formatTimeDisplay = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container-custom py-8">
        {/* Welcome Header with Animation */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 relative"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 shadow-2xl border-4 border-white overflow-hidden relative">
            {/* Floating stars */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                  className="absolute text-white/30"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                >
                  <Star size={20} fill="currentColor" />
                </motion.div>
              ))}
            </div>

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <motion.h1
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl font-black text-white mb-3 flex items-center space-x-4"
                >
                  <span>Hey {displayName}!</span>
                  <motion.span
                    animate={{ rotate: [0, 14, -8, 14, 0] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                    className="text-6xl"
                  >
                    👋
                  </motion.span>
                </motion.h1>
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl text-white/90 font-bold"
                >
                  {hasData
                    ? "Ready to learn something awesome today? 🚀"
                    : "Start your first exam and track your progress! 🚀"}
                </motion.p>
              </div>

              {/* Refresh button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-6 h-6 text-white" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid with Fun Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: BookOpen,
              label: "Total Exams",
              value: stats.totalExamsTaken,
              subValue: hasData ? `${stats.completedExams} completed` : null,
              color: "from-blue-400 to-cyan-400",
              emoji: "📚",
              sparkle: true,
            },
            {
              icon: Award,
              label: "Average Score",
              value: hasData ? `${stats.averageScore}%` : "-",
              subValue:
                hasData && stats.bestScore > 0
                  ? `Best: ${stats.bestScore}%`
                  : null,
              color: "from-green-400 to-emerald-400",
              emoji: "🎯",
              sparkle: true,
            },
            {
              icon: Clock,
              label: "Study Time",
              value: hasData ? formatTimeDisplay(stats.totalTimeSpent) : "-",
              subValue: null,
              color: "from-orange-400 to-yellow-400",
              emoji: "⏱️",
              sparkle: false,
            },
            {
              icon:
                stats.improvementPercentage >= 0 ? TrendingUp : TrendingDown,
              label: "Improvement",
              value: hasData
                ? `${stats.improvementPercentage >= 0 ? "+" : ""}${stats.improvementPercentage}%`
                : "-",
              subValue:
                hasData && stats.improvementPercentage > 0
                  ? "Keep it up!"
                  : null,
              color:
                stats.improvementPercentage >= 0
                  ? "from-purple-400 to-pink-400"
                  : "from-orange-400 to-red-400",
              emoji: stats.improvementPercentage >= 0 ? "📈" : "📉",
              sparkle: stats.improvementPercentage > 0,
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: index * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative group"
            >
              <div
                className={`bg-gradient-to-br ${stat.color} rounded-3xl p-6 shadow-xl border-4 border-white hover:shadow-2xl transition-all`}
              >
                {stat.sparkle && (
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-4 right-4 text-white/30"
                  >
                    <Sparkles size={24} />
                  </motion.div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="h-10 w-10 text-white" strokeWidth={3} />
                  <span className="text-4xl">{stat.emoji}</span>
                </div>

                <p className="text-white/90 font-bold text-sm mb-1">
                  {stat.label}
                </p>
                <p className="text-4xl font-black text-white">{stat.value}</p>
                {stat.subValue && (
                  <p className="text-white/70 text-sm font-medium mt-1">
                    {stat.subValue}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Exams */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl p-8 shadow-xl border-4 border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-gray-800 flex items-center space-x-3">
                  <Flame className="h-8 w-8 text-orange-500" />
                  <span>Recent Exams</span>
                </h2>
                <Link to={ROUTES.EXAMS}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg"
                  >
                    {hasData ? "View All →" : "Take Exam →"}
                  </motion.button>
                </Link>
              </div>

              {recentAttempts.length === 0 ? (
                <EmptyStateCard />
              ) : (
                <div className="space-y-4">
                  {recentAttempts.map((attempt, index) => (
                    <RecentExamCard
                      key={attempt.id}
                      attempt={attempt}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Strong Topics */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-green-400 to-emerald-400 rounded-3xl p-6 shadow-xl border-4 border-white"
            >
              <h3 className="font-black text-white text-2xl mb-4 flex items-center space-x-2">
                <Trophy className="h-7 w-7" />
                <span>Your Superpowers! 💪</span>
              </h3>
              {strongTopics.length === 0 ? (
                <p className="text-white/80 font-semibold">
                  Complete some exams to discover your strengths!
                </p>
              ) : (
                <div className="space-y-3">
                  {strongTopics.map((topic, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center space-x-3 bg-white/30 backdrop-blur-sm rounded-xl p-3"
                    >
                      <Star
                        className="h-5 w-5 text-yellow-300"
                        fill="currentColor"
                      />
                      <span className="font-bold text-white text-lg">
                        {topic}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Weak Topics */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-orange-400 to-red-400 rounded-3xl p-6 shadow-xl border-4 border-white"
            >
              <h3 className="font-black text-white text-2xl mb-4 flex items-center space-x-2">
                <Target className="h-7 w-7" />
                <span>Let's Improve! 📚</span>
              </h3>
              {weakTopics.length === 0 ? (
                <p className="text-white/80 font-semibold">
                  {hasData
                    ? "You're doing great across all topics!"
                    : "Take some exams to see areas for improvement!"}
                </p>
              ) : (
                <div className="space-y-3">
                  {weakTopics.map((topic, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center space-x-3 bg-white/30 backdrop-blur-sm rounded-xl p-3"
                    >
                      <Zap className="h-5 w-5 text-yellow-300" />
                      <span className="font-bold text-white text-lg">
                        {topic}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl p-6 shadow-xl border-4 border-white"
            >
              <h3 className="font-black text-white text-2xl mb-4 flex items-center space-x-2">
                <Sparkles className="h-7 w-7" />
                <span>Quick Actions</span>
              </h3>
              <div className="space-y-3">
                <Link to={ROUTES.EXAMS}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-4 bg-white text-purple-600 rounded-xl font-black text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    🚀 Start New Exam
                  </motion.button>
                </Link>
                <Link to={ROUTES.RESULTS}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-4 bg-white/30 backdrop-blur-sm text-white rounded-xl font-bold text-lg border-4 border-white/50 hover:bg-white/40 transition-all"
                  >
                    📊 View All Results
                  </motion.button>
                </Link>
                <Link to={ROUTES.PROFILE}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-4 bg-white/30 backdrop-blur-sm text-white rounded-xl font-bold text-lg border-4 border-white/50 hover:bg-white/40 transition-all"
                  >
                    👤 View Profile
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Motivational Banner */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 rounded-3xl p-8 shadow-2xl border-4 border-white text-center relative overflow-hidden"
        >
          {/* Animated stars */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              className="absolute text-white/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              <Star size={20} fill="currentColor" />
            </motion.div>
          ))}

          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white mb-3">
              {hasData ? "You're Doing AMAZING! 🌟" : "Ready to Start? 🌟"}
            </h2>
            <p className="text-xl text-white/90 font-bold mb-5">
              {hasData
                ? `You've completed ${stats.completedExams} exam${stats.completedExams !== 1 ? "s" : ""}! Keep practicing to improve even more!`
                : "Take your first exam and begin your learning journey!"}
            </p>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-6xl"
            >
              🎉
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function EmptyStateCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-2xl font-black text-gray-800 mb-2">No exams yet!</h3>
      <p className="text-gray-600 font-semibold mb-6">
        Take your first exam to see your progress here.
      </p>
      <Link to={ROUTES.EXAMS}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl font-black text-lg shadow-lg"
        >
          Browse Exams 🚀
        </motion.button>
      </Link>
    </motion.div>
  );
}

function RecentExamCard({
  attempt,
  index,
}: {
  attempt: RecentAttemptWithExam;
  index: number;
}) {
  const percentage = attempt.percentage || 0;

  const getGrade = (pct: number) => {
    if (pct >= 90)
      return {
        emoji: "🌟",
        text: "Amazing!",
        color: "from-yellow-400 to-orange-400",
      };
    if (pct >= 80)
      return {
        emoji: "🎉",
        text: "Great!",
        color: "from-green-400 to-emerald-400",
      };
    if (pct >= 70)
      return {
        emoji: "👍",
        text: "Good!",
        color: "from-blue-400 to-cyan-400",
      };
    if (pct >= 60)
      return {
        emoji: "💪",
        text: "Keep Going!",
        color: "from-purple-400 to-pink-400",
      };
    return {
      emoji: "📚",
      text: "Practice More!",
      color: "from-gray-400 to-gray-500",
    };
  };

  const grade = getGrade(percentage);

  // Format time
  const formatTimeSpent = (seconds: number | null): string => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5 + index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-r from-gray-50 to-white border-4 border-gray-200 rounded-2xl p-5 hover:border-purple-300 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-black text-gray-800 text-lg mb-1">
            {attempt.exam?.title || "Exam"}
          </h3>
          <div className="flex items-center space-x-3 text-sm text-gray-600 font-semibold">
            <span className="flex items-center space-x-1">
              <Target className="h-4 w-4" />
              <span>
                {attempt.score}/{attempt.total_points}
              </span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatTimeSpent(attempt.time_spent_seconds)}</span>
            </span>
            <span>•</span>
            <span>
              {formatDate(attempt.completed_at || attempt.started_at)}
            </span>
          </div>
          {attempt.exam?.subject && (
            <span className="inline-block mt-2 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
              {attempt.exam.subject}
            </span>
          )}
        </div>
        <div
          className={`bg-gradient-to-r ${grade.color} px-4 py-2 rounded-xl shadow-lg`}
        >
          <div className="text-center">
            <div className="text-2xl mb-1">{grade.emoji}</div>
            <div className="text-white font-black text-xl">{percentage}%</div>
            <div className="text-white/90 font-bold text-xs">{grade.text}</div>
          </div>
        </div>
      </div>

      {/* View Results Link */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <Link
          to={`/exam/${attempt.exam_id}/results/${attempt.id}`}
          className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center space-x-1"
        >
          <span>View Details</span>
          <CheckCircle className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
