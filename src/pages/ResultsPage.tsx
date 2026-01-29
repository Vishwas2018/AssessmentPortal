import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Clock,
  Target,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  BookOpen,
  TrendingUp,
  Star,
  Eye,
  ArrowUpDown,
  RefreshCw,
  Award,
} from "lucide-react";
import { useAuthStore } from "@/store";
import { supabase } from "@/lib/supabase";
import { ROUTES } from "@/data/constants";

// ============================================
// TYPES
// ============================================

interface ExamAttemptWithExam {
  id: string;
  exam_id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  time_spent_seconds: number | null;
  score: number | null;
  total_points: number | null;
  percentage: number | null;
  status: "in_progress" | "completed" | "abandoned";
  answers: Record<string, string> | null;
  flagged: string[] | null;
  exam: {
    id: string;
    title: string;
    exam_type: string;
    subject: string;
    year_level: number;
    duration_minutes: number;
    total_questions: number;
  };
}

interface ResultsStats {
  totalAttempts: number;
  completedExams: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
}

type SortField = "date" | "score" | "title";
type SortOrder = "asc" | "desc";

// ============================================
// MAIN COMPONENT
// ============================================

export default function ResultsPage() {
  const { user } = useAuthStore();
  const [attempts, setAttempts] = useState<ExamAttemptWithExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedExamType, setSelectedExamType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("completed");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // UI State
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all exam attempts
  useEffect(() => {
    async function fetchAttempts() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("exam_attempts")
          .select(
            `
            *,
            exam:exams (
              id,
              title,
              exam_type,
              subject,
              year_level,
              duration_minutes,
              total_questions
            )
          `,
          )
          .eq("user_id", user.id)
          .order("started_at", { ascending: false });

        if (fetchError) {
          console.error("Error fetching attempts:", fetchError);
          setError("Failed to load your exam history");
          return;
        }

        setAttempts(
          (data || []).map((item) => ({
            ...item,
            exam: item.exam as ExamAttemptWithExam["exam"],
          })),
        );
      } catch (err) {
        console.error("Error:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAttempts();
  }, [user?.id]);

  // Calculate stats from real data
  const stats: ResultsStats = useMemo(() => {
    const completed = attempts.filter((a) => a.status === "completed");
    const validScores = completed.filter((a) => a.percentage !== null);

    return {
      totalAttempts: attempts.length,
      completedExams: completed.length,
      averageScore:
        validScores.length > 0
          ? Math.round(
              validScores.reduce((sum, a) => sum + (a.percentage || 0), 0) /
                validScores.length,
            )
          : 0,
      bestScore:
        validScores.length > 0
          ? Math.max(...validScores.map((a) => a.percentage || 0))
          : 0,
      totalTimeSpent: completed.reduce(
        (sum, a) => sum + (a.time_spent_seconds || 0),
        0,
      ),
    };
  }, [attempts]);

  // Get unique subjects and exam types for filters
  const subjects = useMemo(() => {
    const uniqueSubjects = new Set(
      attempts.map((a) => a.exam?.subject).filter(Boolean),
    );
    return Array.from(uniqueSubjects);
  }, [attempts]);

  const examTypes = useMemo(() => {
    const uniqueTypes = new Set(
      attempts.map((a) => a.exam?.exam_type).filter(Boolean),
    );
    return Array.from(uniqueTypes);
  }, [attempts]);

  // Filter and sort attempts
  const filteredAttempts = useMemo(() => {
    let filtered = [...attempts];

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((a) => a.status === selectedStatus);
    }

    // Filter by subject
    if (selectedSubject !== "all") {
      filtered = filtered.filter((a) => a.exam?.subject === selectedSubject);
    }

    // Filter by exam type
    if (selectedExamType !== "all") {
      filtered = filtered.filter((a) => a.exam?.exam_type === selectedExamType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.exam?.title?.toLowerCase().includes(query) ||
          a.exam?.subject?.toLowerCase().includes(query),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "date":
          comparison =
            new Date(a.completed_at || a.started_at).getTime() -
            new Date(b.completed_at || b.started_at).getTime();
          break;
        case "score":
          comparison = (a.percentage || 0) - (b.percentage || 0);
          break;
        case "title":
          comparison = (a.exam?.title || "").localeCompare(b.exam?.title || "");
          break;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [
    attempts,
    selectedStatus,
    selectedSubject,
    selectedExamType,
    searchQuery,
    sortField,
    sortOrder,
  ]);

  // Refresh function
  const handleRefresh = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data } = await supabase
        .from("exam_attempts")
        .select(
          `
          *,
          exam:exams (
            id, title, exam_type, subject, year_level, duration_minutes, total_questions
          )
        `,
        )
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });

      setAttempts(
        (data || []).map((item) => ({
          ...item,
          exam: item.exam as ExamAttemptWithExam["exam"],
        })),
      );
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle sort
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Format helpers
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatSubject = (subject: string): string => {
    const subjectMap: Record<string, string> = {
      maths: "Mathematics",
      mathematics: "Mathematics",
      science: "Science",
      english: "English",
      reading: "Reading",
      writing: "Writing",
      numeracy: "Numeracy",
    };
    return (
      subjectMap[subject?.toLowerCase()] ||
      subject?.charAt(0).toUpperCase() + subject?.slice(1) ||
      "Unknown"
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-2xl font-bold text-gray-600">
            Loading your results...
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
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
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="container-custom">
        {/* Page Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-800 mb-2">
                My Results 📊
              </h1>
              <p className="text-gray-600 font-semibold">
                Track your progress and review past exams
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-6 h-6 text-indigo-600" />
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: BookOpen,
              label: "Total Exams",
              value: stats.completedExams,
              color: "from-blue-400 to-cyan-400",
              emoji: "📚",
            },
            {
              icon: Target,
              label: "Average Score",
              value: stats.averageScore > 0 ? `${stats.averageScore}%` : "-",
              color: "from-green-400 to-emerald-400",
              emoji: "🎯",
            },
            {
              icon: Trophy,
              label: "Best Score",
              value: stats.bestScore > 0 ? `${stats.bestScore}%` : "-",
              color: "from-yellow-400 to-orange-400",
              emoji: "🏆",
            },
            {
              icon: Clock,
              label: "Total Time",
              value:
                stats.totalTimeSpent > 0
                  ? formatTime(stats.totalTimeSpent)
                  : "-",
              color: "from-purple-400 to-pink-400",
              emoji: "⏱️",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 shadow-lg border-4 border-white`}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-6 h-6 text-white" />
                <span className="text-2xl">{stat.emoji}</span>
              </div>
              <p className="text-white/80 text-sm font-semibold">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-8 border-4 border-gray-100"
        >
          {/* Search and Filter Toggle */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all ${
                showFilters
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {showFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="abandoned">Abandoned</option>
                    </select>
                  </div>

                  {/* Subject Filter */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Subject
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">All Subjects</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {formatSubject(subject)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Exam Type Filter */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Exam Type
                    </label>
                    <select
                      value={selectedExamType}
                      onChange={(e) => setSelectedExamType(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">All Types</option>
                      {examTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sort Options */}
          <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm font-bold text-gray-600">Sort by:</span>
            {[
              { field: "date" as SortField, label: "Date" },
              { field: "score" as SortField, label: "Score" },
              { field: "title" as SortField, label: "Title" },
            ].map((option) => (
              <button
                key={option.field}
                onClick={() => toggleSort(option.field)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  sortField === option.field
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{option.label}</span>
                {sortField === option.field && (
                  <ArrowUpDown className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {filteredAttempts.length === 0 ? (
            <EmptyState
              hasAttempts={attempts.length > 0}
              onClearFilters={() => {
                setSearchQuery("");
                setSelectedSubject("all");
                setSelectedExamType("all");
                setSelectedStatus("all");
              }}
            />
          ) : (
            <div className="space-y-4">
              {filteredAttempts.map((attempt, index) => (
                <ResultCard
                  key={attempt.id}
                  attempt={attempt}
                  index={index}
                  formatTime={formatTime}
                  formatDate={formatDate}
                  formatSubject={formatSubject}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Results Count */}
        {filteredAttempts.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 font-semibold mt-6"
          >
            Showing {filteredAttempts.length} of {attempts.length} results
          </motion.p>
        )}
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function EmptyState({
  hasAttempts,
  onClearFilters,
}: {
  hasAttempts: boolean;
  onClearFilters: () => void;
}) {
  if (hasAttempts) {
    // Has attempts but filters exclude all
    return (
      <div className="bg-white rounded-3xl shadow-xl p-12 text-center border-4 border-gray-100">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-2xl font-black text-gray-800 mb-2">
          No matching results
        </h3>
        <p className="text-gray-600 font-semibold mb-6">
          Try adjusting your filters to see more exams.
        </p>
        <button
          onClick={onClearFilters}
          className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  // No attempts at all
  return (
    <div className="bg-white rounded-3xl shadow-xl p-12 text-center border-4 border-gray-100">
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-2xl font-black text-gray-800 mb-2">
        No exams taken yet!
      </h3>
      <p className="text-gray-600 font-semibold mb-6">
        Complete your first exam to see your results here.
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
    </div>
  );
}

function ResultCard({
  attempt,
  index,
  formatTime,
  formatDate,
  formatSubject,
}: {
  attempt: ExamAttemptWithExam;
  index: number;
  formatTime: (seconds: number) => string;
  formatDate: (dateStr: string) => string;
  formatSubject: (subject: string) => string;
}) {
  const percentage = attempt.percentage || 0;
  const isCompleted = attempt.status === "completed";

  const getGradeBadge = (pct: number) => {
    if (pct >= 90)
      return {
        emoji: "🌟",
        text: "Excellent!",
        color: "from-yellow-400 to-orange-400",
      };
    if (pct >= 80)
      return {
        emoji: "🎉",
        text: "Great!",
        color: "from-green-400 to-emerald-400",
      };
    if (pct >= 70)
      return { emoji: "👍", text: "Good!", color: "from-blue-400 to-cyan-400" };
    if (pct >= 60)
      return {
        emoji: "💪",
        text: "Keep Going!",
        color: "from-purple-400 to-pink-400",
      };
    return {
      emoji: "📚",
      text: "Practice More",
      color: "from-gray-400 to-gray-500",
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return { text: "Completed", color: "bg-green-100 text-green-700" };
      case "in_progress":
        return { text: "In Progress", color: "bg-yellow-100 text-yellow-700" };
      case "abandoned":
        return { text: "Abandoned", color: "bg-gray-100 text-gray-600" };
      default:
        return { text: status, color: "bg-gray-100 text-gray-600" };
    }
  };

  const grade = getGradeBadge(percentage);
  const statusBadge = getStatusBadge(attempt.status);

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-2xl shadow-lg border-4 border-gray-100 overflow-hidden hover:border-indigo-200 transition-all"
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Exam Info */}
          <div className="flex-1">
            <div className="flex items-start space-x-4">
              {/* Score Circle (for completed) */}
              {isCompleted && (
                <div
                  className={`hidden md:flex w-16 h-16 rounded-full bg-gradient-to-br ${grade.color} items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white font-black text-lg">
                    {percentage}%
                  </span>
                </div>
              )}

              <div className="flex-1">
                {/* Title */}
                <h3 className="text-xl font-black text-gray-800 mb-2">
                  {attempt.exam?.title || "Untitled Exam"}
                </h3>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {/* Subject Badge */}
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                    {formatSubject(attempt.exam?.subject || "")}
                  </span>

                  {/* Exam Type Badge */}
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                    {attempt.exam?.exam_type || "Exam"}
                  </span>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full font-semibold ${statusBadge.color}`}
                  >
                    {statusBadge.text}
                  </span>

                  {/* Flagged indicator */}
                  {attempt.flagged && attempt.flagged.length > 0 && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>{attempt.flagged.length} flagged</span>
                    </span>
                  )}
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600 font-semibold">
                  {/* Date */}
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(attempt.completed_at || attempt.started_at)}
                    </span>
                  </span>

                  {/* Score */}
                  {isCompleted && (
                    <span className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>
                        {attempt.score}/{attempt.total_points} correct
                      </span>
                    </span>
                  )}

                  {/* Time */}
                  {attempt.time_spent_seconds && (
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(attempt.time_spent_seconds)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions & Grade */}
          <div className="flex items-center space-x-4">
            {/* Grade Badge (Mobile & Desktop) */}
            {isCompleted && (
              <div className="md:hidden flex items-center space-x-2">
                <span className="text-3xl">{grade.emoji}</span>
                <div>
                  <p className="font-black text-gray-800 text-xl">
                    {percentage}%
                  </p>
                  <p className="text-xs text-gray-500 font-semibold">
                    {grade.text}
                  </p>
                </div>
              </div>
            )}

            {/* Desktop Grade Text */}
            {isCompleted && (
              <div className="hidden md:block text-center">
                <span className="text-3xl">{grade.emoji}</span>
                <p className="text-sm text-gray-600 font-semibold">
                  {grade.text}
                </p>
              </div>
            )}

            {/* View Button */}
            {isCompleted ? (
              <Link to={`/exam/${attempt.exam_id}/results/${attempt.id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  <Eye className="w-5 h-5" />
                  <span>View Details</span>
                </motion.button>
              </Link>
            ) : (
              <Link to={`/exam/${attempt.exam_id}/take/${attempt.id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Continue</span>
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
