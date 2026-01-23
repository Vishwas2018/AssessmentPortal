import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Sparkles,
  Zap,
  Trophy,
  Clock,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";

// Types
interface Question {
  id: string;
  exam_id: string;
  question_number: number;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  points: number;
  image_url?: string;
}

interface Exam {
  id: string;
  title: string;
  duration_minutes: number;
  [key: string]: unknown;
}

// Helper to clean question text
function cleanQuestionText(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\\n/g, " ")
    .replace(/---/g, "\n\n")
    .replace(/\s+/g, " ")
    .trim();
}

// Format time as MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Kid-friendly encouragement messages
const encouragements = [
  "You're doing great! 🌟",
  "Keep going, superstar! ⭐",
  "Awesome work! 🎉",
  "You've got this! 💪",
  "Amazing progress! 🚀",
  "Way to go! 🏆",
  "Super smart! 🧠",
];

// Fun option colors
const optionColors = [
  {
    bg: "from-blue-400 to-blue-500",
    light: "bg-blue-50 border-blue-200 hover:border-blue-400",
    selected: "bg-blue-500",
  },
  {
    bg: "from-green-400 to-green-500",
    light: "bg-green-50 border-green-200 hover:border-green-400",
    selected: "bg-green-500",
  },
  {
    bg: "from-yellow-400 to-orange-500",
    light: "bg-yellow-50 border-yellow-200 hover:border-yellow-400",
    selected: "bg-orange-500",
  },
  {
    bg: "from-purple-400 to-purple-500",
    light: "bg-purple-50 border-purple-200 hover:border-purple-400",
    selected: "bg-purple-500",
  },
];

export default function ExamPage() {
  const { examId, attemptId } = useParams<{
    examId: string;
    attemptId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // State
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementText, setEncouragementText] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAnsweredCount = useRef(0);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flagged.size;
  const progressPercent =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const timePercent = totalTime > 0 ? (timeRemaining / totalTime) * 100 : 100;

  // Add this at the very top of your ExamPage.tsx, inside the fetchExamData function
  // Replace the useEffect that starts with "async function fetchExamData()"

  useEffect(() => {
    async function fetchExamData() {
      console.log("=== FETCH EXAM DATA START ===");
      console.log("examId:", examId);
      console.log("attemptId:", attemptId);
      console.log("user:", user);

      if (!examId || !attemptId || !user) {
        console.error("Missing required data:", { examId, attemptId, user });
        setError("Invalid exam session");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch exam
        console.log("Fetching exam with ID:", examId);
        const { data: examData, error: examError } = await supabase
          .from("exams")
          .select("*")
          .eq("id", examId)
          .single();

        console.log("Exam fetch result:", { examData, examError });

        if (examError || !examData) {
          console.error("Exam fetch error:", examError);
          setError("Exam not found");
          setIsLoading(false);
          return;
        }
        setExam(examData);

        // Fetch questions
        console.log("Fetching questions for exam:", examId);
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .eq("exam_id", examId)
          .order("question_number", { ascending: true });

        console.log("Questions fetch result:", {
          questionsData,
          questionsError,
          count: questionsData?.length,
        });

        if (questionsError || !questionsData || questionsData.length === 0) {
          console.error("Questions fetch error:", questionsError);
          setError("No questions found for this exam");
          setIsLoading(false);
          return;
        }
        setQuestions(questionsData);

        // Fetch attempt
        console.log("Fetching attempt with ID:", attemptId);
        const { data: attemptData, error: attemptError } = await supabase
          .from("exam_attempts")
          .select("*")
          .eq("id", attemptId)
          .single();

        console.log("Attempt fetch result:", { attemptData, attemptError });

        if (attemptError || !attemptData) {
          console.error("Attempt fetch error:", attemptError);
          setError("Exam session not found");
          setIsLoading(false);
          return;
        }

        console.log("Attempt data details:", {
          status: attemptData.status,
          started_at: attemptData.started_at,
          user_id: attemptData.user_id,
          exam_id: attemptData.exam_id,
        });

        // Check if attempt belongs to this user
        if (attemptData.user_id !== user.id) {
          console.error("Attempt user mismatch:", {
            attempt_user: attemptData.user_id,
            current_user: user.id,
          });
          setError("This exam attempt does not belong to you");
          setIsLoading(false);
          return;
        }

        // Check if attempt is already completed
        if (attemptData.status === "completed") {
          console.warn("Attempt already completed, redirecting to results");
          navigate(`/exam/${examId}/results/${attemptId}`, { replace: true });
          return;
        }

        // Restore answers if any
        if (attemptData.answers && typeof attemptData.answers === "object") {
          console.log("Restoring answers:", attemptData.answers);
          setAnswers(attemptData.answers as Record<string, string>);
        }

        // Calculate remaining time
        const startTime = new Date(attemptData.started_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const totalSeconds = (examData.duration_minutes || 30) * 60;
        const remaining = Math.max(0, totalSeconds - elapsed);

        console.log("Time calculation:", {
          started_at: attemptData.started_at,
          elapsed_seconds: elapsed,
          total_seconds: totalSeconds,
          remaining_seconds: remaining,
        });

        setTimeRemaining(remaining);
        setTotalTime(totalSeconds);

        console.log("=== FETCH EXAM DATA SUCCESS ===");
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching exam:", err);
        console.error("Error details:", {
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
        });
        setError("Failed to load exam");
        setIsLoading(false);
      }
    }

    fetchExamData();
  }, [examId, attemptId, user, navigate]);

  // Timer countdown
  useEffect(() => {
    if (isLoading || timeRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - auto submit
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (isLoading || !attemptId) return;

    autoSaveRef.current = setInterval(() => {
      saveAnswers();
    }, 30000);

    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [isLoading, attemptId, answers]);

  // Show encouragement when answering questions
  useEffect(() => {
    if (
      answeredCount > 0 &&
      answeredCount !== lastAnsweredCount.current &&
      answeredCount % 3 === 0
    ) {
      const randomMsg =
        encouragements[Math.floor(Math.random() * encouragements.length)];
      setEncouragementText(randomMsg);
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 2500);
    }
    lastAnsweredCount.current = answeredCount;
  }, [answeredCount]);

  // Save answers to database
  const saveAnswers = useCallback(async () => {
    if (!attemptId) return;
    try {
      await supabase
        .from("exam_attempts")
        .update({ answers })
        .eq("id", attemptId);
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  }, [attemptId, answers]);

  // Handle answer selection
  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Toggle flag on question
  const toggleFlag = (questionId: string) => {
    setFlagged((prev) => {
      const newFlagged = new Set(prev);
      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId);
      } else {
        newFlagged.add(questionId);
      }
      return newFlagged;
    });
  };

  // Navigate to question
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentIndex(index);
    }
  };

  // FIXED: Submit exam with ROBUST answer comparison and detailed logging
  const handleSubmit = async (isAutoSubmit = false) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setShowSubmitModal(false);

    try {
      // Calculate score with ROBUST comparison
      let score = 0;
      let totalPoints = 0;

      console.log("=== STARTING SCORE CALCULATION ===");
      console.log("Total questions:", questions.length);
      console.log("User answers:", answers);

      questions.forEach((q) => {
        const points = q.points || 1;
        totalPoints += points;
        const userAnswer = answers[q.id];

        console.log(`\n--- Question ${q.question_number} ---`);
        console.log("Question text:", q.question_text.substring(0, 50) + "...");
        console.log("User answer:", userAnswer);
        console.log("Correct answer in DB:", q.correct_answer);
        console.log("Question type:", q.question_type);
        console.log("Options:", q.options);

        if (userAnswer && q.correct_answer) {
          // Normalize both answers for comparison
          const normalizedUserAnswer = userAnswer.trim().toUpperCase();
          const normalizedCorrectAnswer = q.correct_answer.trim().toUpperCase();

          console.log("Normalized user:", normalizedUserAnswer);
          console.log("Normalized correct:", normalizedCorrectAnswer);

          // ROBUST COMPARISON LOGIC:
          let isCorrect = false;

          // Method 1: Direct letter comparison (A, B, C, D)
          if (normalizedUserAnswer === normalizedCorrectAnswer) {
            isCorrect = true;
            console.log("✓ CORRECT: Direct match (letter to letter)");
          }
          // Method 2: If DB has full text, compare against option text
          else if (
            q.question_type === "multiple_choice" &&
            q.options &&
            Array.isArray(q.options)
          ) {
            // Convert user's letter (A, B, C, D) to array index (0, 1, 2, 3)
            const letterCode = normalizedUserAnswer.charCodeAt(0);
            if (letterCode >= 65 && letterCode <= 90) {
              // A-Z
              const optionIndex = letterCode - 65; // A=0, B=1, C=2, D=3
              const selectedOptionText = q.options[optionIndex];

              console.log(
                "Checking option index:",
                optionIndex,
                "Option text:",
                selectedOptionText,
              );

              if (selectedOptionText) {
                const normalizedOptionText = selectedOptionText
                  .trim()
                  .toUpperCase();
                console.log("Normalized option text:", normalizedOptionText);

                if (normalizedOptionText === normalizedCorrectAnswer) {
                  isCorrect = true;
                  console.log(
                    "✓ CORRECT: Option text matches DB correct answer",
                  );
                  console.log(
                    `  User selected: ${userAnswer} (${selectedOptionText})`,
                  );
                  console.log(`  DB has: ${q.correct_answer}`);
                } else {
                  console.log("✗ No match between option text and DB answer");
                  console.log(`  Option text: "${normalizedOptionText}"`);
                  console.log(`  DB answer: "${normalizedCorrectAnswer}"`);
                }
              } else {
                console.log("⚠ Warning: Option index out of range");
              }
            } else {
              console.log("⚠ Warning: User answer is not a valid letter (A-Z)");
            }
          }
          // Method 3: True/False comparison
          else if (q.question_type === "true_false") {
            const normalizedUser = normalizedUserAnswer.replace(/\s/g, "");
            const normalizedCorrect = normalizedCorrectAnswer.replace(
              /\s/g,
              "",
            );
            if (normalizedUser === normalizedCorrect) {
              isCorrect = true;
              console.log("✓ CORRECT: True/False match");
            }
          }

          if (isCorrect) {
            score += points;
            console.log(
              `✓ Adding ${points} points. New score: ${score}/${totalPoints}`,
            );
          } else {
            console.log("✗ INCORRECT: No match found");
          }
        } else {
          console.log("⚠ Skipped: No answer or no correct answer defined");
        }
      });

      const percentage =
        totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
      const timeSpent = exam ? totalTime - timeRemaining : 0;

      console.log("\n=== FINAL RESULTS ===");
      console.log("Score:", score, "/", totalPoints);
      console.log("Percentage:", percentage, "%");
      console.log("Time Spent:", timeSpent, "seconds");

      // Update attempt in database
      const { data, error: updateError } = await supabase
        .from("exam_attempts")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          answers: answers,
          score: score,
          total_points: totalPoints,
          percentage: percentage,
          time_spent_seconds: timeSpent,
        })
        .eq("id", attemptId)
        .select()
        .single();

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error(updateError.message);
      }

      console.log("Exam submitted successfully:", data);

      // Clear timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);

      // Navigate to results
      navigate(`/exam/${examId}/results/${attemptId}`, { replace: true });
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to submit exam. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Get timer bar color based on time remaining
  const getTimerColor = () => {
    if (timePercent > 50) return "from-emerald-400 to-green-500";
    if (timePercent > 25) return "from-amber-400 to-yellow-500";
    return "from-red-400 to-rose-500";
  };

  const getTimerBgColor = () => {
    if (timePercent > 50) return "bg-emerald-100";
    if (timePercent > 25) return "bg-amber-100";
    return "bg-red-100";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-8xl mb-6"
          >
            🚀
          </motion.div>
          <p className="text-2xl font-bold text-gray-700">
            Loading your exam...
          </p>
          <p className="text-gray-500 mt-2">Get ready to shine! ✨</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !exam || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error || "Unable to load exam"}</p>
          <button
            onClick={() => navigate("/exams")}
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors"
          >
            Back to Exams
          </button>
        </motion.div>
      </div>
    );
  }

  const isLowTime = timePercent < 25;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Encouragement Popup */}
      <AnimatePresence>
        {showEncouragement && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-32 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold text-xl flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              {encouragementText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Timer Bar */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        {/* Timer Bar - Full Width */}
        <div className={`h-3 ${getTimerBgColor()} relative overflow-hidden`}>
          <motion.div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getTimerColor()}`}
            animate={{ width: `${timePercent}%` }}
            transition={{ duration: 0.5 }}
          />
          {isLowTime && (
            <motion.div
              className="absolute inset-0 bg-red-400/40"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Exam Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800 text-lg">
                  {exam.title}
                </h1>
                <p className="text-sm text-gray-500">
                  Question {currentIndex + 1} of {totalQuestions} •
                  <span className="text-green-600 font-semibold ml-1">
                    {answeredCount} answered
                  </span>
                </p>
              </div>
            </div>

            {/* Timer & Progress */}
            <div className="flex items-center gap-4">
              {/* Timer Display */}
              <motion.div
                animate={isLowTime ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${
                  isLowTime
                    ? "bg-red-100 text-red-600"
                    : "bg-indigo-100 text-indigo-600"
                }`}
              >
                <Clock className="w-5 h-5" />
                {formatTime(timeRemaining)}
              </motion.div>

              {/* Progress Circle */}
              <div className="hidden sm:block relative w-12 h-12">
                <svg className="w-12 h-12 -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#e5e7eb"
                    strokeWidth="4"
                    fill="none"
                  />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#8b5cf6"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    animate={{
                      strokeDasharray: `${(progressPercent / 100) * 126} 126`,
                    }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                  {Math.round(progressPercent)}%
                </span>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSubmitModal(true)}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">Submit</span>
                <span className="text-lg">🎯</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Question Card */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden"
              >
                {/* Question Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      {currentIndex + 1}
                    </span>
                    <div className="text-white">
                      <p className="font-bold">Question {currentIndex + 1}</p>
                      <p className="text-white/80 text-sm">
                        {currentQuestion.points || 1} point
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={`p-3 rounded-xl transition-all ${
                      flagged.has(currentQuestion.id)
                        ? "bg-yellow-400 text-yellow-900"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    <Star
                      className={`w-6 h-6 ${flagged.has(currentQuestion.id) ? "fill-current" : ""}`}
                    />
                  </motion.button>
                </div>

                {/* Question Body */}
                <div className="p-6 sm:p-8">
                  {/* Question Text */}
                  <div className="mb-8">
                    <p className="text-xl sm:text-2xl font-semibold text-gray-800 leading-relaxed">
                      {cleanQuestionText(currentQuestion.question_text)}
                    </p>
                    {currentQuestion.image_url && (
                      <img
                        src={currentQuestion.image_url}
                        alt="Question"
                        className="mt-4 rounded-xl max-w-full h-auto shadow-md"
                      />
                    )}
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option, idx) => {
                      const optionLetter = String.fromCharCode(65 + idx);
                      const isSelected =
                        answers[currentQuestion.id] === optionLetter;
                      const colors = optionColors[idx % optionColors.length];

                      return (
                        <motion.button
                          key={`option-${currentQuestion.id}-${idx}`}
                          whileHover={{ scale: 1.02, x: 8 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleAnswer(currentQuestion.id, optionLetter)
                          }
                          className={`w-full p-4 sm:p-5 rounded-2xl border-3 text-left transition-all flex items-center gap-4 ${
                            isSelected
                              ? `border-transparent bg-gradient-to-r ${colors.bg} text-white shadow-lg`
                              : `border-2 ${colors.light}`
                          }`}
                        >
                          <span
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                              isSelected ? "bg-white/30" : "bg-white shadow-sm"
                            }`}
                          >
                            {optionLetter}
                          </span>
                          <span
                            className={`font-medium text-lg ${isSelected ? "text-white" : "text-gray-700"}`}
                          >
                            {option}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-7 h-7 ml-auto text-white" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                    <motion.button
                      whileHover={{ scale: 1.05, x: -4 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => goToQuestion(currentIndex - 1)}
                      disabled={currentIndex === 0}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold ${
                        currentIndex === 0
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Previous
                    </motion.button>

                    {currentIndex === totalQuestions - 1 ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowSubmitModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg"
                      >
                        <Trophy className="w-5 h-5" />
                        Finish! 🎉
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05, x: 4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => goToQuestion(currentIndex + 1)}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold shadow-lg"
                      >
                        Next
                        <ChevronRight className="w-5 h-5" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Question Navigator */}
          <div className="lg:w-80">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-xl p-6 sticky top-28"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">
                  Question Map
                </h3>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-4 text-center border-2 border-green-200">
                  <p className="text-3xl font-bold text-green-600">
                    {answeredCount}
                  </p>
                  <p className="text-xs text-green-700 font-medium">✅ Done</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl p-4 text-center border-2 border-yellow-200">
                  <p className="text-3xl font-bold text-orange-500">
                    {flaggedCount}
                  </p>
                  <p className="text-xs text-orange-600 font-medium">
                    ⭐ Starred
                  </p>
                </div>
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2 mb-4 max-h-64 overflow-y-auto">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isFlagged = flagged.has(q.id);
                  const isCurrent = idx === currentIndex;

                  return (
                    <motion.button
                      key={`nav-${q.id}`}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => goToQuestion(idx)}
                      className={`relative w-11 h-11 rounded-xl font-bold text-sm transition-all ${
                        isCurrent
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white ring-4 ring-indigo-200 shadow-lg"
                          : isAnswered
                            ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 text-xs">
                          ⭐
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-4 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg" />
                  <span className="text-gray-600">Answered ✓</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-gray-100 rounded-lg" />
                  <span className="text-gray-600">Not answered yet</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="relative w-6 h-6 bg-gray-100 rounded-lg">
                    <span className="absolute -top-1 -right-1 text-xs">⭐</span>
                  </span>
                  <span className="text-gray-600">Starred for review</span>
                </div>
              </div>

              {/* Tip */}
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs text-indigo-600 font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Click ⭐ to mark questions for review!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !isSubmitting && setShowSubmitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-7xl mb-4"
                >
                  🎯
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Ready to Submit?
                </h3>
                <p className="text-gray-600 mb-4">
                  You've answered{" "}
                  <span className="font-bold text-green-600">
                    {answeredCount}
                  </span>{" "}
                  of <span className="font-bold">{totalQuestions}</span>{" "}
                  questions.
                </p>

                {answeredCount < totalQuestions && (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-6">
                    <p className="text-amber-700 font-medium flex items-center justify-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      {totalQuestions - answeredCount} questions are still
                      empty!
                    </p>
                  </div>
                )}

                {flaggedCount > 0 && (
                  <p className="text-gray-500 mb-6">
                    You have{" "}
                    <span className="font-bold text-orange-500">
                      {flaggedCount}
                    </span>{" "}
                    starred questions.
                  </p>
                )}

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSubmitModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-4 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Keep Working 📝
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>Submit! 🚀</>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
