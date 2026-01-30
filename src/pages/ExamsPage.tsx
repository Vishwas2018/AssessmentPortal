// src/pages/ExamsPage.tsx
// FIXED: Correct route to /exam/:examId/start
// ============================================

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
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";

// Define constants inline to ensure unique keys
const EXAM_TYPES = [
  { value: "all", label: "All Types", emoji: "📋" },
  { value: "NAPLAN", label: "NAPLAN", emoji: "📘" },
  { value: "ICAS", label: "ICAS", emoji: "📕" },
];

const YEAR_LEVELS = [
  { value: "all", label: "All Years", emoji: "🎓" },
  { value: "2", label: "Year 2", emoji: "2️⃣" },
  { value: "3", label: "Year 3", emoji: "3️⃣" },
  { value: "4", label: "Year 4", emoji: "4️⃣" },
  { value: "5", label: "Year 5", emoji: "5️⃣" },
  { value: "6", label: "Year 6", emoji: "6️⃣" },
  { value: "7", label: "Year 7", emoji: "7️⃣" },
  { value: "8", label: "Year 8", emoji: "8️⃣" },
  { value: "9", label: "Year 9", emoji: "9️⃣" },
];

const SUBJECTS = [
  { value: "all", label: "All Subjects", emoji: "📚" },
  { value: "mathematics", label: "Mathematics", emoji: "🔢" },
  { value: "english", label: "English", emoji: "📖" },
  { value: "reading", label: "Reading", emoji: "📰" },
  { value: "writing", label: "Writing", emoji: "✍️" },
  { value: "language", label: "Language", emoji: "🗣️" },
  { value: "spelling", label: "Spelling", emoji: "🔤" },
  { value: "grammar", label: "Grammar", emoji: "📝" },
  { value: "science", label: "Science", emoji: "🔬" },
];

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
  const { profile } = useAuthStore();
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

        setExams((data as Exam[]) || []);
        setFilteredExams((data as Exam[]) || []);
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
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-10 h-10 text-indigo-600" />
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
                {EXAM_TYPES.map((type, index) => (
                  <option
                    key={`type-${type.value}-${index}`}
                    value={type.value}
                  >
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
                {YEAR_LEVELS.map((year, index) => (
                  <option
                    key={`year-${year.value}-${index}`}
                    value={year.value}
                  >
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
                {SUBJECTS.map((subject, index) => (
                  <option
                    key={`subject-${subject.value}-${index}`}
                    value={subject.value}
                  >
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
            Showing {filteredExams.length} exams 🎯
          </p>
        </motion.div>

        {/* Exams Grid */}
        {filteredExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Card Header */}
                <div
                  className={`bg-gradient-to-r ${getTypeColor(exam.exam_type)} p-4`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white/80 text-sm font-medium">
                          {exam.exam_type}
                        </p>
                        <p className="text-white font-bold">
                          Year {exam.year_level}
                        </p>
                      </div>
                    </div>
                    {exam.is_free && (
                      <span className="px-3 py-1 bg-white/20 text-white text-sm font-bold rounded-full flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        FREE
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    {exam.title}
                  </h3>

                  {exam.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {exam.description}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
                      {exam.subject}
                    </span>
                    {exam.difficulty && (
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded-full border ${getDifficultyColor(exam.difficulty)}`}
                      >
                        {exam.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      <span>{exam.total_questions} Q</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{exam.duration_minutes} min</span>
                    </div>
                  </div>

                  {/* Action Button - FIXED: Correct route */}
                  <Link to={`/exam/${exam.id}/start`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-3 bg-gradient-to-r ${getTypeColor(exam.exam_type)} text-white font-bold rounded-xl flex items-center justify-center gap-2 group-hover:shadow-lg transition-all`}
                    >
                      Start Exam
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No exams found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search query.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
