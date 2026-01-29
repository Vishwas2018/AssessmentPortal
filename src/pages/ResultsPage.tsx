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

interface ExamData {
  id: string;
  title: string;
  exam_type: string;
  subject: string;
  year_level: number;
  duration_minutes: number;
  total_questions: number;
}

interface ExamAttemptRaw {
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
  exam: ExamData | ExamData[] | null;
}

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
  exam: ExamData | null;
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

// Helper to normalize exam data
function normalizeExamData(
  exam: ExamData | ExamData[] | null,
): ExamData | null {
  if (!exam) return null;
  if (Array.isArray(exam)) return exam[0] || null;
  return exam;
}

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

        // Transform data with proper typing
        const transformedData: ExamAttemptWithExam[] = (data || []).map(
          (item: ExamAttemptRaw) => ({
            ...item,
            exam: normalizeExamData(item.exam),
          }),
        );

        setAttempts(transformedData);
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
      attempts.map((a) => a.exam?.subject).filter(Boolean) as string[],
    );
    return Array.from(uniqueSubjects);
  }, [attempts]);

  const examTypes = useMemo(() => {
    const uniqueTypes = new Set(
      attempts.map((a) => a.exam?.exam_type).filter(Boolean) as string[],
    );
    return Array.from(uniqueTypes);
  }, [attempts]);

  // Filter and sort attempts
  const filteredAttempts = useMemo(() => {
    let filtered = [...attempts];

    if (selectedStatus !== "all") {
      filtered = filtered.filter((a) => a.status === selectedStatus);
    }

    if (selectedSubject !== "all") {
      filtered = filtered.filter((a) => a.exam?.subject === selectedSubject);
    }

    if (selectedExamType !== "all") {
      filtered = filtered.filter((a) => a.exam?.exam_type === selectedExamType);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.exam?.title?.toLowerCase().includes(query) ||
          a.exam?.subject?.toLowerCase().includes(query),
      );
    }

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

      const transformedData: ExamAttemptWithExam[] = (data || []).map(
        (item: ExamAttemptRaw) => ({
          ...item,
          exam: normalizeExamData(item.exam),
        }),
      );

      setAttempts(transformedData);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format time helper
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  // Format date helper
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // Format subject helper
  const formatSubject = (subject: string): string => {
    const subjectMap: Record<string, string> = {
      mathematics: "Maths 🔢",
      english: "English 📚",
      science: "Science 🔬",
      "general-ability": "General Ability 🧠",
    };
    return subjectMap[subject?.toLowerCase()] || subject || "Unknown";
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSubject("all");
    setSelectedExamType("all");
    setSelectedStatus("completed");
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

  // Loading state
  if (isLoading && attempts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading your results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2">
              My Results 📊
            </h1>
            <p className="text-gray-600 font-semibold">
              Track your progress and see how you're improving!
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="mt-4 md:mt-0 flex items-center space-x-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="font-semibold">Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl p-4 shadow-lg border-4 border-indigo-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-800">
                  {stats.completedExams}
                </p>
                <p className="text-sm text-gray-500 font-semibold">Completed</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-lg border-4 border-green-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-800">
                  {stats.averageScore}%
                </p>
                <p className="text-sm text-gray-500 font-semibold">Avg Score</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 shadow-lg border-4 border-yellow-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-800">
                  {stats.bestScore}%
                </p>
                <p className="text-sm text-gray-500 font-semibold">
                  Best Score
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-4 shadow-lg border-4 border-purple-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-800">
                  {formatTime(stats.totalTimeSpent)}
                </p>
                <p className="text-sm text-gray-500 font-semibold">
                  Total Time
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-300 focus:bg-white transition-all font-semibold"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                showFilters
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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

            {/* Sort Buttons */}
            <div className="flex space-x-2">
              {[
                { field: "date" as SortField, label: "Date" },
                { field: "score" as SortField, label: "Score" },
                { field: "title" as SortField, label: "Name" },
              ].map(({ field, label }) => (
                <button
                  key={field}
                  onClick={() => toggleSort(field)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    sortField === field
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span>{label}</span>
                  {sortField === field && <ArrowUpDown className="w-3 h-3" />}
                </button>
              ))}
            </div>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-300 font-semibold"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="abandoned">Abandoned</option>
                    </select>
                  </div>

                  {/* Subject Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Subject
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-300 font-semibold"
                    >
                      <option value="all">All Subjects</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Exam Type Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Exam Type
                    </label>
                    <select
                      value={selectedExamType}
                      onChange={(e) => setSelectedExamType(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 rounded-xl border-2 border-transparent focus:border-indigo-300 font-semibold"
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
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {filteredAttempts.length > 0 ? (
            filteredAttempts.map((attempt, index) => (
              <ResultCard
                key={attempt.id}
                attempt={attempt}
                index={index}
                formatTime={formatTime}
                formatDate={formatDate}
                formatSubject={formatSubject}
              />
            ))
          ) : (
            <EmptyState
              hasAttempts={attempts.length > 0}
              hasFilters={
                searchQuery !== "" ||
                selectedSubject !== "all" ||
                selectedExamType !== "all" ||
                selectedStatus !== "completed"
              }
              onClearFilters={clearFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function EmptyState({
  hasAttempts,
  hasFilters,
  onClearFilters,
}: {
  hasAttempts: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  if (hasAttempts && hasFilters) {
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
          <div className="flex-1">
            <div className="flex items-start space-x-4">
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
                <h3 className="text-xl font-black text-gray-800 mb-2">
                  {attempt.exam?.title || "Untitled Exam"}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                    {formatSubject(attempt.exam?.subject || "")}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                    {attempt.exam?.exam_type || "Exam"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full font-semibold ${statusBadge.color}`}
                  >
                    {statusBadge.text}
                  </span>
                  {attempt.flagged && attempt.flagged.length > 0 && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>{attempt.flagged.length} flagged</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600 font-semibold">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(attempt.completed_at || attempt.started_at)}
                    </span>
                  </span>
                  {isCompleted && (
                    <span className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>
                        {attempt.score}/{attempt.total_points} correct
                      </span>
                    </span>
                  )}
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

          <div className="flex items-center space-x-4">
            {isCompleted && (
              <>
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
                <div className="hidden md:block text-center">
                  <span className="text-3xl">{grade.emoji}</span>
                  <p className="text-sm text-gray-600 font-semibold">
                    {grade.text}
                  </p>
                </div>
              </>
            )}

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
