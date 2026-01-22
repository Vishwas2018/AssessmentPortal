import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {  
  Star,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Home,
  BookOpen,  
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/data/constants";
import type { Question, ExamAttempt, Exam } from "@/types/supabase";
import confetti from "canvas-confetti";

export default function ExamResultsPage() {
  const { examId, attemptId } = useParams<{
    examId: string;
    attemptId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [exam, setExam] = useState<Exam | null>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);

  // Fetch results data
  useEffect(() => {
    async function fetchResults() {
      if (!examId || !attemptId || !user) {
        setError("Results not found");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch exam
        const { data: examData, error: examError } = await supabase
          .from("exams")
          .select("*")
          .eq("id", examId)
          .single();

        if (examError || !examData) {
          setError("Exam not found");
          setIsLoading(false);
          return;
        }

        setExam(examData);

        // Fetch attempt
        const { data: attemptData, error: attemptError } = await supabase
          .from("exam_attempts")
          .select("*")
          .eq("id", attemptId)
          .eq("user_id", user.id)
          .single();

        if (attemptError || !attemptData) {
          setError("Results not found");
          setIsLoading(false);
          return;
        }

        setAttempt(attemptData);

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .eq("exam_id", examId)
          .order("question_number", { ascending: true });

        if (!questionsError) {
          setQuestions(questionsData || []);
        }

        setIsLoading(false);

        // Trigger confetti for good scores
        if (attemptData.percentage && attemptData.percentage >= 70) {
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          }, 500);
        }
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("Failed to load results");
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [examId, attemptId, user]);

  // Format time
  const formatTime = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get grade info
  const getGradeInfo = (percentage: number | null) => {
    if (!percentage)
      return {
        emoji: "📚",
        text: "Keep Practicing!",
        color: "from-gray-400 to-gray-500",
        message: "Don't give up!",
      };
    if (percentage >= 90)
      return {
        emoji: "🌟",
        text: "Outstanding!",
        color: "from-yellow-400 to-orange-400",
        message: "You're a superstar!",
      };
    if (percentage >= 80)
      return {
        emoji: "🎉",
        text: "Excellent!",
        color: "from-green-400 to-emerald-400",
        message: "Amazing work!",
      };
    if (percentage >= 70)
      return {
        emoji: "👍",
        text: "Great Job!",
        color: "from-blue-400 to-cyan-400",
        message: "Well done!",
      };
    if (percentage >= 60)
      return {
        emoji: "💪",
        text: "Good Effort!",
        color: "from-purple-400 to-pink-400",
        message: "Keep it up!",
      };
    return {
      emoji: "📚",
      text: "Keep Practicing!",
      color: "from-orange-400 to-red-400",
      message: "You'll do better next time!",
    };
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
          <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-2xl font-bold text-gray-600">Loading results...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !exam || !attempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-md"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-6">{error || "Results not found"}</p>
          <Link to={ROUTES.EXAMS}>
            <button className="px-6 py-3 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors">
              Back to Exams
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const gradeInfo = getGradeInfo(attempt.percentage);
  const answers = (attempt.answers as Record<string, string>) || {};
  const correctCount = questions.filter(
    (q) => answers[q.id] === q.correct_answer,
  ).length;
  const incorrectCount = questions.filter(
    (q) => answers[q.id] && answers[q.id] !== q.correct_answer,
  ).length;
  const unansweredCount = questions.length - Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Floating stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 360],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute text-yellow-300"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <Star size={15 + Math.random() * 20} fill="currentColor" />
          </motion.div>
        ))}
      </div>

      <div className="container-custom py-8 relative z-10">
        {/* Results Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="max-w-3xl mx-auto"
        >
          {/* Main Score Card */}
          <div
            className={`bg-gradient-to-r ${gradeInfo.color} rounded-3xl p-8 shadow-2xl text-white text-center mb-8 relative overflow-hidden`}
          >
            {/* Background decorations */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                  className="absolute"
                  style={{
                    left: `${10 + i * 10}%`,
                    top: `${20 + (i % 3) * 30}%`,
                  }}
                >
                  <Star size={30} fill="currentColor" />
                </motion.div>
              ))}
            </div>

            <div className="relative z-10">
              {/* Trophy Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <span className="text-7xl">{gradeInfo.emoji}</span>
              </motion.div>

              {/* Score */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-6xl font-black mb-2">
                  {attempt.percentage}%
                </h1>
                <p className="text-3xl font-bold text-white/90 mb-2">
                  {gradeInfo.text}
                </p>
                <p className="text-xl text-white/80">{gradeInfo.message}</p>
              </motion.div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: Target,
                label: "Score",
                value: `${attempt.score}/${attempt.total_points}`,
                color: "from-blue-400 to-cyan-400",
              },
              {
                icon: CheckCircle2,
                label: "Correct",
                value: correctCount,
                color: "from-green-400 to-emerald-400",
              },
              {
                icon: XCircle,
                label: "Incorrect",
                value: incorrectCount,
                color: "from-red-400 to-rose-400",
              },
              {
                icon: Clock,
                label: "Time",
                value: formatTime(attempt.time_spent_seconds),
                color: "from-purple-400 to-pink-400",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white rounded-2xl p-4 shadow-lg text-center border-4 border-gray-100"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-black text-gray-800">
                  {stat.value}
                </p>
                <p className="text-gray-500 font-semibold">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Review Toggle */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => setShowReview(!showReview)}
            className="w-full bg-white rounded-2xl p-4 shadow-lg mb-6 flex items-center justify-between hover:bg-gray-50 transition-colors border-4 border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-primary-500" />
              <span className="font-bold text-gray-800">
                Review Your Answers
              </span>
            </div>
            {showReview ? (
              <ChevronUp className="w-6 h-6 text-gray-500" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-500" />
            )}
          </motion.button>

          {/* Questions Review */}
          <AnimatePresence>
            {showReview && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 mb-8 overflow-hidden"
              >
                {questions.map((question, index) => {
                  const userAnswer = answers[question.id];
                  const isCorrect = userAnswer === question.correct_answer;
                  const isExpanded = expandedQuestion === question.id;

                  return (
                    <motion.div
                      key={question.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-white rounded-2xl shadow-lg overflow-hidden border-4 ${
                        isCorrect
                          ? "border-green-200"
                          : userAnswer
                            ? "border-red-200"
                            : "border-gray-200"
                      }`}
                    >
                      <button
                        onClick={() =>
                          setExpandedQuestion(isExpanded ? null : question.id)
                        }
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <span
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                              isCorrect
                                ? "bg-green-500"
                                : userAnswer
                                  ? "bg-red-500"
                                  : "bg-gray-400"
                            }`}
                          >
                            {isCorrect ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : userAnswer ? (
                              <XCircle className="w-5 h-5" />
                            ) : (
                              "?"
                            )}
                          </span>
                          <div className="text-left">
                            <p className="font-bold text-gray-800">
                              Question {index + 1}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {question.question_text.substring(0, 50)}...
                            </p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0 border-t border-gray-100">
                              <p className="text-gray-800 font-medium mb-4">
                                {question.question_text}
                              </p>

                              {/* Options */}
                              <div className="space-y-2 mb-4">
                                {question.question_type === "multiple_choice" &&
                                  question.options &&
                                  (question.options as string[]).map(
                                    (option, i) => {
                                      const isUserAnswer =
                                        option === userAnswer;
                                      const isCorrectAnswer =
                                        option === question.correct_answer;

                                      return (
                                        <div
                                          key={i}
                                          className={`p-3 rounded-xl flex items-center space-x-3 ${
                                            isCorrectAnswer
                                              ? "bg-green-100 border-2 border-green-300"
                                              : isUserAnswer
                                                ? "bg-red-100 border-2 border-red-300"
                                                : "bg-gray-50 border-2 border-gray-200"
                                          }`}
                                        >
                                          <span
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                              isCorrectAnswer
                                                ? "bg-green-500 text-white"
                                                : isUserAnswer
                                                  ? "bg-red-500 text-white"
                                                  : "bg-gray-200 text-gray-600"
                                            }`}
                                          >
                                            {String.fromCharCode(65 + i)}
                                          </span>
                                          <span className="font-medium text-gray-700 flex-1">
                                            {option}
                                          </span>
                                          {isCorrectAnswer && (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                          )}
                                          {isUserAnswer && !isCorrectAnswer && (
                                            <XCircle className="w-5 h-5 text-red-500" />
                                          )}
                                        </div>
                                      );
                                    },
                                  )}

                                {question.question_type === "true_false" &&
                                  ["True", "False"].map((option) => {
                                    const isUserAnswer = option === userAnswer;
                                    const isCorrectAnswer =
                                      option === question.correct_answer;

                                    return (
                                      <div
                                        key={option}
                                        className={`p-3 rounded-xl flex items-center space-x-3 ${
                                          isCorrectAnswer
                                            ? "bg-green-100 border-2 border-green-300"
                                            : isUserAnswer
                                              ? "bg-red-100 border-2 border-red-300"
                                              : "bg-gray-50 border-2 border-gray-200"
                                        }`}
                                      >
                                        <span
                                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                                            isCorrectAnswer
                                              ? "bg-green-500 text-white"
                                              : isUserAnswer
                                                ? "bg-red-500 text-white"
                                                : "bg-gray-200 text-gray-600"
                                          }`}
                                        >
                                          {option === "True" ? "✓" : "✗"}
                                        </span>
                                        <span className="font-medium text-gray-700 flex-1">
                                          {option}
                                        </span>
                                        {isCorrectAnswer && (
                                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        )}
                                        {isUserAnswer && !isCorrectAnswer && (
                                          <XCircle className="w-5 h-5 text-red-500" />
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>

                              {/* Explanation */}
                              {question.explanation && (
                                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                                  <p className="text-sm font-bold text-blue-700 mb-1">
                                    💡 Explanation
                                  </p>
                                  <p className="text-blue-800">
                                    {question.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to={`/exam/${examId}/start`} className="flex-1">
              <button className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-3">
                <RotateCcw className="w-6 h-6" />
                <span>Try Again</span>
              </button>
            </Link>
            <Link to={ROUTES.EXAMS} className="flex-1">
              <button className="w-full py-4 rounded-2xl font-bold text-lg bg-white border-4 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center space-x-3">
                <BookOpen className="w-6 h-6" />
                <span>More Exams</span>
              </button>
            </Link>
            <Link to={ROUTES.DASHBOARD} className="flex-1">
              <button className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-3">
                <Home className="w-6 h-6" />
                <span>Dashboard</span>
              </button>
            </Link>
          </motion.div>

          {/* Encouragement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-500 font-semibold">
              {(attempt.percentage || 0) >= 70
                ? "🎉 Great job! Keep up the fantastic work!"
                : "💪 Practice makes perfect! Try another exam to improve!"}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
