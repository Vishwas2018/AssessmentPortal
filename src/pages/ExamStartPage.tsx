import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Target,
  AlertCircle,
  ChevronLeft,
  Rocket,
  Star,
  CheckCircle2,
  Loader2,
  HelpCircle,
  Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/data/constants";
import type { Exam } from "@/types/supabase";

export default function ExamStartPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExam() {
      if (!examId) {
        setError("Exam not found");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch exam details
        const { data: examData, error: examError } = await supabase
          .from("exams")
          .select("*")
          .eq("id", examId)
          .single();

        if (examError || !examData) {
          console.error("Exam fetch error:", examError);
          setError("Exam not found");
          setIsLoading(false);
          return;
        }

        setExam(examData);

        // Fetch question count
        const { count, error: countError } = await supabase
          .from("questions")
          .select("*", { count: "exact", head: true })
          .eq("exam_id", examId);

        if (!countError && count !== null) {
          setQuestionCount(count);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching exam:", err);
        setError("Failed to load exam");
        setIsLoading(false);
      }
    }

    fetchExam();
  }, [examId]);

  const handleStartExam = async () => {
    if (!user || !examId || !exam) {
      setError("Please log in to start the exam");
      return;
    }

    setIsStarting(true);
    setError(null);

    try {
      console.log("Creating exam attempt for user:", user.id, "exam:", examId);

      // Create exam attempt
      const { data: attempt, error: attemptError } = await supabase
        .from("exam_attempts")
        .insert({
          user_id: user.id,
          exam_id: examId,
          status: "in_progress",
          started_at: new Date().toISOString(),
          answers: {},
          score: null,
          total_points: exam.total_questions,
          percentage: null,
          time_spent_seconds: null,
        })
        .select()
        .single();

      if (attemptError) {
        console.error("Error creating attempt:", attemptError);
        setError(`Failed to start exam: ${attemptError.message}`);
        setIsStarting(false);
        return;
      }

      if (!attempt) {
        console.error("No attempt data returned");
        setError("Failed to start exam. Please try again.");
        setIsStarting(false);
        return;
      }

      console.log("Attempt created successfully:", attempt.id);

      // Navigate to exam page with attempt ID
      const examUrl = `/exam/${examId}/take/${attempt.id}`;
      console.log("Navigating to:", examUrl);
      navigate(examUrl);
    } catch (err) {
      console.error("Error starting exam:", err);
      setError("Failed to start exam. Please try again.");
      setIsStarting(false);
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
          <p className="text-2xl font-bold text-gray-600">Loading exam...</p>
        </motion.div>
      </div>
    );
  }

  if (error && !exam) {
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
          <Link to={ROUTES.EXAMS}>
            <button className="px-6 py-3 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors">
              Back to Exams
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!exam) {
    return null;
  }

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "Easy":
        return "from-green-400 to-emerald-400";
      case "Medium":
        return "from-yellow-400 to-orange-400";
      case "Hard":
        return "from-red-400 to-rose-400";
      default:
        return "from-blue-400 to-cyan-400";
    }
  };

  const getExamTypeColor = (type: string) => {
    return type === "NAPLAN"
      ? "from-blue-500 to-indigo-500"
      : "from-purple-500 to-pink-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Floating stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute text-yellow-300"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <Star size={20 + Math.random() * 20} fill="currentColor" />
          </motion.div>
        ))}
      </div>

      <div className="container-custom py-8 relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <Link
            to={ROUTES.EXAMS}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 font-bold mb-8 group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Exams</span>
          </Link>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Exam Card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-gray-100"
          >
            {/* Header */}
            <div
              className={`bg-gradient-to-r ${getExamTypeColor(exam.exam_type)} p-8 text-white relative overflow-hidden`}
            >
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
                    style={{
                      left: `${20 + i * 20}%`,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <Star size={40} fill="currentColor" />
                  </motion.div>
                ))}
              </div>

              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full font-bold text-sm">
                    {exam.exam_type}
                  </span>
                  <span className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full font-bold text-sm">
                    Year {exam.year_level}
                  </span>
                  {exam.difficulty && (
                    <span
                      className={`px-4 py-1 bg-gradient-to-r ${getDifficultyColor(exam.difficulty)} rounded-full font-bold text-sm`}
                    >
                      {exam.difficulty}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-black mb-2">{exam.title}</h1>
                <p className="text-white/90 font-medium text-lg">
                  {exam.subject}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start space-x-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 font-medium">{error}</p>
                </motion.div>
              )}

              {/* Description */}
              {exam.description && (
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  {exam.description}
                </p>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 text-center border-2 border-blue-100"
                >
                  <HelpCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-3xl font-black text-gray-800">
                    {questionCount || exam.total_questions}
                  </p>
                  <p className="text-gray-600 font-semibold">Questions</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center border-2 border-purple-100"
                >
                  <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-3xl font-black text-gray-800">
                    {exam.duration_minutes}
                  </p>
                  <p className="text-gray-600 font-semibold">Minutes</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 text-center border-2 border-green-100"
                >
                  <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-3xl font-black text-gray-800">
                    {exam.total_questions}
                  </p>
                  <p className="text-gray-600 font-semibold">Points</p>
                </motion.div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 rounded-2xl p-6 mb-8 border-2 border-yellow-200">
                <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center space-x-2">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  <span>Before You Start 📝</span>
                </h3>
                <ul className="space-y-3">
                  {[
                    "Read each question carefully before answering",
                    "You can skip questions and come back to them later",
                    "Watch the timer - manage your time wisely!",
                    'Click "Submit" when you\'re done or time runs out',
                    "Have fun and do your best! 🌟",
                  ].map((instruction, index) => (
                    <motion.li
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">
                        {instruction}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Start Button */}
              <motion.button
                onClick={handleStartExam}
                disabled={isStarting || !user}
                whileHover={{ scale: isStarting ? 1 : 1.02 }}
                whileTap={{ scale: isStarting ? 1 : 0.98 }}
                className="w-full py-5 rounded-2xl font-black text-2xl bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-4"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-8 h-8" />
                    <span>Start Exam!</span>
                    <span className="text-3xl">🚀</span>
                  </>
                )}
              </motion.button>

              {!user && (
                <p className="text-center text-red-500 font-semibold mt-4">
                  Please log in to start the exam
                </p>
              )}

              {/* Encouragement */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-gray-500 font-semibold mt-6"
              >
                You've got this! Good luck! 🍀
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
