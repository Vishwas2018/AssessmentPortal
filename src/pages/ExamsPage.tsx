import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  Clock,
  Target,
  Star,
  ChevronRight,
  Loader2,
  X,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";
import { EXAM_TYPES, YEAR_LEVELS, SUBJECTS } from "@/data/constants";

// Types
interface Exam {
  id: string;
  title: string;
  description: string | null;
  exam_type: "NAPLAN" | "ICAS";
  subject: string;
  year_level: number;
  duration_minutes: number;
  total_questions: number;
  difficulty: "Easy" | "Medium" | "Hard" | null;
  is_free: boolean;
  is_active: boolean;
}

export default function ExamsPage() {
  const { user, profile } = useAuthStore();
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");

  // Fetch exams from Supabase
  useEffect(() => {
    async function fetchExams() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("exams")
          .select("*")
          .eq("is_active", true)
          .order("year_level", { ascending: true })
          .order("title", { ascending: true });

        if (fetchError) {
          console.error("Error fetching exams:", fetchError);
          setError("Failed to load exams. Please try again.");
          return;
        }

        setExams(data || []);
        setFilteredExams(data || []);
      } catch (err) {
        console.error("Error:", err);
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchExams();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...exams];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (exam) =>
          exam.title.toLowerCase().includes(query) ||
          exam.subject.toLowerCase().includes(query) ||
          exam.description?.toLowerCase().includes(query),
      );
    }

    // Type filter
    if (selectedType !== "all") {
      result = result.filter((exam) => exam.exam_type === selectedType);
    }

    // Year filter
    if (selectedYear !== "all") {
      result = result.filter(
        (exam) => exam.year_level === parseInt(selectedYear),
      );
    }

    // Subject filter
    if (selectedSubject !== "all") {
      result = result.filter((exam) =>
        exam.subject.toLowerCase().includes(selectedSubject.toLowerCase()),
      );
    }

    setFilteredExams(result);
  }, [exams, searchQuery, selectedType, selectedYear, selectedSubject]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedYear("all");
    setSelectedSubject("all");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedType !== "all" ||
    selectedYear !== "all" ||
    selectedSubject !== "all";

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700 border-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Get exam type color
  const getTypeColor = (type: string) => {
    return type === "NAPLAN"
      ? "from-blue-500 to-indigo-600"
      : "from-purple-500 to-pink-600";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-2xl font-bold text-gray-700">Loading exams...</p>
          <p className="text-gray-500 mt-2">
            Finding the best tests for you! ✨
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-800">
              Browse Exams 📚
            </h1>
          </div>
          <p className="text-gray-600 font-medium ml-15">
            Choose an exam and start practicing! You've got this! 💪
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-4 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none font-medium transition-colors"
              />
            </div>

            {/* Filter Toggles */}
            <div className="flex flex-wrap gap-2">
              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none font-semibold bg-white"
              >
                {EXAM_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.emoji} {type.label}
                  </option>
                ))}
              </select>

              {/* Year Filter */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none font-semibold bg-white"
              >
                {YEAR_LEVELS.map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.emoji} {year.label}
                  </option>
                ))}
              </select>

              {/* Subject Filter */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none font-semibold bg-white"
              >
                {SUBJECTS.map((subject) => (
                  <option key={subject.value} value={subject.value}>
                    {subject.emoji} {subject.label}
                  </option>
                ))}
              </select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 rounded-xl bg-red-100 text-red-600 font-semibold hover:bg-red-200 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-gray-600 font-semibold">
            {filteredExams.length === 0
              ? "No exams found 😢"
              : `Showing ${filteredExams.length} exam${filteredExams.length !== 1 ? "s" : ""} 🎯`}
          </p>
        </motion.div>

        {/* Exams Grid */}
        {filteredExams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-12 text-center"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No exams match your filters
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters to find more exams.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors"
            >
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredExams.map((exam, index) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Link to={`/exam/${exam.id}/start`}>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-gray-100 hover:border-indigo-200 h-full flex flex-col">
                      {/* Card Header */}
                      <div
                        className={`bg-gradient-to-r ${getTypeColor(exam.exam_type)} p-4 relative`}
                      >
                        {/* Free Badge */}
                        {exam.is_free && (
                          <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold flex items-center gap-1">
                            <Star className="w-3 h-3" fill="currentColor" />
                            FREE
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                            <span className="text-2xl">
                              {exam.exam_type === "NAPLAN" ? "📘" : "📗"}
                            </span>
                          </div>
                          <div>
                            <span className="text-white/80 text-sm font-semibold">
                              {exam.exam_type}
                            </span>
                            <p className="text-white font-bold">
                              Year {exam.year_level}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">
                          {exam.title}
                        </h3>

                        {exam.description && (
                          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                            {exam.description}
                          </p>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                            {exam.subject}
                          </span>
                          {exam.difficulty && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(exam.difficulty)}`}
                            >
                              {exam.difficulty}
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto">
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {exam.total_questions} Q
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {exam.duration_minutes} min
                          </span>
                        </div>

                        {/* Start Button */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-center flex items-center justify-center gap-2 hover:shadow-lg transition-shadow">
                            Start Exam
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Motivational Footer */}
        {filteredExams.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl font-bold shadow-lg">
              <Sparkles className="w-5 h-5" />
              Pick an exam and show what you can do! 🚀
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
