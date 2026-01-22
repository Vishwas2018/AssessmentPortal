import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Target,
  Filter,
  Search,
  Star,
  Sparkles,
  ChevronRight,
  Loader2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Exam } from "@/types/supabase";

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  // Fetch exams from Supabase
  useEffect(() => {
    async function fetchExams() {
      try {
        const { data, error: fetchError } = await supabase
          .from("exams")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("Error fetching exams:", fetchError);
          setError("Failed to load exams");
          setIsLoading(false);
          return;
        }

        setExams(data || []);
        setFilteredExams(data || []);
        setIsLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load exams");
        setIsLoading(false);
      }
    }

    fetchExams();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...exams];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (exam) =>
          exam.title.toLowerCase().includes(query) ||
          exam.subject.toLowerCase().includes(query) ||
          exam.description?.toLowerCase().includes(query),
      );
    }

    if (selectedType !== "all") {
      result = result.filter((exam) => exam.exam_type === selectedType);
    }

    if (selectedYear !== "all") {
      result = result.filter(
        (exam) => exam.year_level === parseInt(selectedYear),
      );
    }

    if (selectedSubject !== "all") {
      result = result.filter((exam) => exam.subject === selectedSubject);
    }

    setFilteredExams(result);
  }, [exams, searchQuery, selectedType, selectedYear, selectedSubject]);

  // Get unique values for filters
  const examTypes = [...new Set(exams.map((e) => e.exam_type))];
  const yearLevels = [...new Set(exams.map((e) => e.year_level))].sort(
    (a, b) => a - b,
  );
  const subjects = [...new Set(exams.map((e) => e.subject))];

  const getTypeColor = (type: string) => {
    return type === "NAPLAN"
      ? "from-blue-500 to-indigo-500"
      : "from-purple-500 to-pink-500";
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-2xl font-bold text-gray-600">Loading exams...</p>
        </motion.div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-black text-gray-800 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Floating decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute text-purple-300"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <Star size={20 + Math.random() * 15} fill="currentColor" />
          </motion.div>
        ))}
      </div>

      <div className="container-custom py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 shadow-2xl border-4 border-white text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute"
                  style={{ left: `${20 + i * 20}%`, top: "50%" }}
                >
                  <Sparkles size={40} />
                </motion.div>
              ))}
            </div>
            <div className="relative z-10">
              <h1 className="text-5xl font-black mb-3 flex items-center space-x-4">
                <GraduationCap className="w-12 h-12" />
                <span>Practice Exams</span>
                <span className="text-6xl">📚</span>
              </h1>
              <p className="text-xl text-white/90 font-bold">
                Choose an exam and start practicing! You've got this! 💪
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-xl mb-8 border-4 border-gray-100"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-primary-500" />
            <span className="font-bold text-gray-800">Filter Exams</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 font-semibold focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 font-semibold focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="all">All Types</option>
              {examTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 font-semibold focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="all">All Years</option>
              {yearLevels.map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 font-semibold focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="all">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
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
            Showing{" "}
            <span className="text-primary-600 font-bold">
              {filteredExams.length}
            </span>{" "}
            exams
            {filteredExams.length !== exams.length && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("all");
                  setSelectedYear("all");
                  setSelectedSubject("all");
                }}
                className="ml-2 text-primary-500 hover:underline"
              >
                Clear filters
              </button>
            )}
          </p>
        </motion.div>

        {/* Exams Grid */}
        {filteredExams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-12 shadow-xl text-center border-4 border-gray-100"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">
              No exams found
            </h3>
            <p className="text-gray-600 font-medium">
              Try adjusting your filters or search query
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Link to={`/exam/${exam.id}/start`}>
                  <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-gray-100 hover:border-primary-300 transition-all h-full">
                    {/* Header */}
                    <div
                      className={`bg-gradient-to-r ${getTypeColor(exam.exam_type)} p-6 text-white relative`}
                    >
                      <div className="absolute top-4 right-4">
                        {exam.is_free && (
                          <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-black">
                            FREE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                          {exam.exam_type}
                        </span>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                          Year {exam.year_level}
                        </span>
                      </div>
                      <h3 className="text-xl font-black">{exam.title}</h3>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-primary-600 font-bold">
                          {exam.subject}
                        </span>
                        {exam.difficulty && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(exam.difficulty)}`}
                          >
                            {exam.difficulty}
                          </span>
                        )}
                      </div>

                      {exam.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {exam.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span className="font-medium">
                            {exam.total_questions} questions
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">
                            {exam.duration_minutes} min
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-primary-600 font-bold group-hover:underline flex items-center space-x-1">
                          <span>Start Exam</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4"
                              fill="currentColor"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
