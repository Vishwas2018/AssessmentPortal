import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  HelpCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";
import { updateUserProgress } from "@/lib/dashboard";

// ============================================
// TYPES
// ============================================

interface Question {
  id: string;
  exam_id: string;
  question_number: number;
  question_text: string;
  question_type: string;
  options: { id: string; text: string }[];
  correct_answer: string;
  explanation: string;
  points: number;
  image_url: string | null;
  hint: string | null;
}

interface Exam {
  id: string;
  title: string;
  exam_type: string;
  subject: string;
  year_level: number;
  duration_minutes: number;
  total_questions: number;
}

interface ExamAttempt {
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
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ExamPage() {
  const { examId, attemptId } = useParams<{
    examId: string;
    attemptId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Data state
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);

  // UI state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set(),
  );
  const [showHint, setShowHint] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Refs for auto-save
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedAnswersRef = useRef<string>("");

  // Current question
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // Stats
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flaggedQuestions.size;

  // ============================================
  // DATA FETCHING
  // ============================================

  useEffect(() => {
    async function loadExamData() {
      if (!examId || !attemptId || !user?.id) {
        setError("Missing required parameters");
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

        const typedExamData = examData as Exam;
        setExam(typedExamData);

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .eq("exam_id", examId)
          .order("question_number", { ascending: true });

        if (questionsError) {
          setError("Failed to load questions");
          setIsLoading(false);
          return;
        }

        // Parse options if needed
        const parsedQuestions = (questionsData || []).map((q: any) => ({
          ...q,
          options:
            typeof q.options === "string" ? JSON.parse(q.options) : q.options,
        }));

        setQuestions(parsedQuestions);

        // Fetch attempt
        const { data: attemptData, error: attemptError } = await supabase
          .from("exam_attempts")
          .select("*")
          .eq("id", attemptId)
          .eq("user_id", user.id)
          .single();

        if (attemptError || !attemptData) {
          setError("Exam attempt not found");
          setIsLoading(false);
          return;
        }

        const typedAttemptData = attemptData as ExamAttempt;

        // Check if already completed
        if (typedAttemptData.status === "completed") {
          navigate(`/exam/${examId}/results/${attemptId}`, { replace: true });
          return;
        }

        setAttempt(typedAttemptData);

        // Restore saved answers
        if (typedAttemptData.answers) {
          setAnswers(typedAttemptData.answers);
          lastSavedAnswersRef.current = JSON.stringify(typedAttemptData.answers);
        }

        // Restore flagged questions from database
        if (typedAttemptData.flagged && Array.isArray(typedAttemptData.flagged)) {
          setFlaggedQuestions(new Set(typedAttemptData.flagged));
        }

        // Calculate remaining time
        const startTime = new Date(typedAttemptData.started_at).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const totalSeconds = typedExamData.duration_minutes * 60;
        const remaining = Math.max(0, totalSeconds - elapsedSeconds);

        setTimeRemaining(remaining);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading exam:", err);
        setError("An unexpected error occurred");
        setIsLoading(false);
      }
    }

    loadExamData();
  }, [examId, attemptId, user?.id, navigate]);

  // ============================================
  // TIMER
  // ============================================

  useEffect(() => {
    if (timeRemaining <= 0 || isLoading || !attempt) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isLoading, attempt]);

  // ============================================
  // AUTO-SAVE (answers + flagged)
  // ============================================

  const saveProgress = useCallback(
    async (
      currentAnswers: Record<string, string>,
      currentFlagged: Set<string>,
    ) => {
      if (!attemptId || !user?.id) return;

      const answersString = JSON.stringify(currentAnswers);

      // Only save if answers changed
      if (answersString === lastSavedAnswersRef.current) return;

      try {
        const { error } = await supabase
          .from("exam_attempts")
          .update({
            answers: currentAnswers,
            flagged: Array.from(currentFlagged),
          } as never)
          .eq("id", attemptId)
          .eq("user_id", user.id);

        if (!error) {
          lastSavedAnswersRef.current = answersString;
        }
      } catch (err) {
        console.error("Auto-save error:", err);
      }
    },
    [attemptId, user?.id],
  );

  // Debounced auto-save
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      saveProgress(answers, flaggedQuestions);
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [answers, flaggedQuestions, saveProgress]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowHint(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowHint(false);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowHint(false);
  };

  const handleSubmitExam = async () => {
    if (!attemptId || !user?.id || !exam || isSubmitting) return;

    setIsSubmitting(true);
    setShowSubmitModal(false);

    try {
      // Calculate score
      let score = 0;
      let totalPoints = 0;

      questions.forEach((question) => {
        totalPoints += question.points || 1;
        const userAnswer = answers[question.id];
        if (userAnswer && userAnswer === question.correct_answer) {
          score += question.points || 1;
        }
      });

      const percentage =
        totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

      // Calculate time spent
      const startTime = attempt
        ? new Date(attempt.started_at).getTime()
        : Date.now();
      const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);

      // Update attempt in database
      const { error: updateError } = await supabase
        .from("exam_attempts")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          answers: answers,
          flagged: Array.from(flaggedQuestions),
          score: score,
          total_points: totalPoints,
          percentage: percentage,
          time_spent_seconds: timeSpentSeconds,
        } as never)
        .eq("id", attemptId)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating attempt:", updateError);
        setError("Failed to submit exam. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Update user progress
      await updateUserProgress(
        user.id,
        exam.id,
        score,
        totalPoints,
        timeSpentSeconds,
      );

      // Show celebration
      setShowCelebration(true);

      // Fire confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"],
      });

      // More confetti bursts
      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
      }, 250);

      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 400);
    } catch (err) {
      console.error("Submit error:", err);
      setError("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  const handleViewResults = () => {
    navigate(`/exam/${examId}/results/${attemptId}`);
  };

  // ============================================
  // FORMAT HELPERS
  // ============================================

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = (): string => {
    if (!exam) return "text-white";
    const totalSeconds = exam.duration_minutes * 60;
    const percentRemaining = (timeRemaining / totalSeconds) * 100;

    if (percentRemaining <= 10) return "text-red-300";
    if (percentRemaining <= 25) return "text-yellow-300";
    return "text-white";
  };

  const getTimerProgress = (): number => {
    if (!exam) return 100;
    const totalSeconds = exam.duration_minutes * 60;
    return (timeRemaining / totalSeconds) * 100;
  };

  // ============================================
  // RENDER STATES
  // ============================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-2xl font-bold text-white">Loading your exam...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 flex items-center justify-center p-4">
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
            onClick={() => navigate("/exams")}
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors"
          >
            Back to Exams
          </button>
        </motion.div>
      </div>
    );
  }

  if (!exam || !currentQuestion) {
    return null;
  }

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 relative overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 rounded-full bg-white/5"
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Sidebar - Question Navigation */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-64 bg-white/10 backdrop-blur-sm p-4 flex flex-col"
        >
          {/* Stats */}
          <div className="mb-4 p-3 bg-white/10 rounded-xl">
            <div className="flex justify-between text-white/80 text-sm font-semibold mb-2">
              <span>✅ {answeredCount} Done</span>
              <span>⭐ {flaggedCount} Flagged</span>
            </div>
          </div>

          {/* Question Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, index) => {
                const isAnswered = answers[q.id] !== undefined;
                const isFlagged = flaggedQuestions.has(q.id);
                const isCurrent = index === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => handleJumpToQuestion(index)}
                    className={`
                      relative w-10 h-10 rounded-lg font-bold text-sm transition-all
                      ${
                        isCurrent
                          ? "bg-indigo-500 text-white ring-2 ring-white"
                          : isAnswered
                            ? "bg-green-500 text-white"
                            : "bg-white/20 text-white hover:bg-white/30"
                      }
                    `}
                  >
                    {index + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 p-3 bg-white/10 rounded-xl text-xs text-white/70">
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-4 h-4 bg-green-500 rounded" />
              <span>Answered</span>
            </div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-4 h-4 bg-white/20 rounded" />
              <span>Unanswered</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="relative w-4 h-4 bg-white/20 rounded">
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full" />
              </span>
              <span>Flagged</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/10 backdrop-blur-sm p-4"
          >
            <div className="flex items-center justify-between">
              {/* Exam Info */}
              <div>
                <h1 className="text-xl font-black text-white">{exam.title}</h1>
                <p className="text-white/70 font-semibold text-sm">
                  {exam.subject} • {exam.exam_type}
                </p>
              </div>

              {/* Timer */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-xl">
                  <Clock className={`w-5 h-5 ${getTimerColor()}`} />
                  <span className={`font-black text-xl ${getTimerColor()}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            </div>

            {/* Timer Progress Bar */}
            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  getTimerProgress() <= 10
                    ? "bg-red-500"
                    : getTimerProgress() <= 25
                      ? "bg-yellow-500"
                      : "bg-gradient-to-r from-green-400 to-emerald-500"
                }`}
                initial={{ width: "100%" }}
                animate={{ width: `${getTimerProgress()}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.header>

          {/* Question Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-3xl mx-auto"
            >
              {/* Question Card */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-white/50">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-black text-lg">
                      Q{currentQuestionIndex + 1}
                    </span>
                    {answers[currentQuestion.id] && (
                      <span className="flex items-center space-x-1 text-green-600 font-semibold">
                        <CheckCircle className="w-5 h-5" />
                        <span>Answered</span>
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Hint Button */}
                    {currentQuestion.hint && (
                      <button
                        onClick={() => setShowHint(!showHint)}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-xl font-bold transition-all ${
                          showHint
                            ? "bg-blue-500 text-white"
                            : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                        }`}
                      >
                        <Lightbulb className="w-4 h-4" />
                        <span>Hint</span>
                      </button>
                    )}

                    {/* Flag Button */}
                    <button
                      onClick={() => handleToggleFlag(currentQuestion.id)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-xl font-bold transition-all ${
                        flaggedQuestions.has(currentQuestion.id)
                          ? "bg-orange-500 text-white"
                          : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                      }`}
                    >
                      <Flag className="w-4 h-4" />
                      <span>
                        {flaggedQuestions.has(currentQuestion.id)
                          ? "Flagged"
                          : "Flag"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Hint Box */}
                <AnimatePresence>
                  {showHint && currentQuestion.hint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl"
                    >
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-blue-700 font-medium">
                          {currentQuestion.hint}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Question Image */}
                {currentQuestion.image_url && (
                  <div className="mb-6">
                    <img
                      src={currentQuestion.image_url}
                      alt="Question"
                      className="max-w-full h-auto rounded-xl border-2 border-gray-200"
                    />
                  </div>
                )}

                {/* Question Text */}
                <div className="mb-8">
                  <p className="text-xl font-bold text-gray-800 leading-relaxed">
                    {formatQuestionText(currentQuestion.question_text)}
                  </p>
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected =
                      answers[currentQuestion.id] === option.id;

                    return (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() =>
                          handleAnswerSelect(currentQuestion.id, option.id)
                        }
                        className={`
                          w-full p-4 rounded-xl border-3 text-left transition-all flex items-center space-x-4
                          ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                          }
                        `}
                      >
                        {/* Radio Circle */}
                        <div
                          className={`
                          w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                          ${isSelected ? "border-indigo-500 bg-indigo-500" : "border-gray-300"}
                        `}
                        >
                          {isSelected && (
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          )}
                        </div>

                        {/* Option Text */}
                        <span
                          className={`font-semibold text-lg ${isSelected ? "text-indigo-700" : "text-gray-700"}`}
                        >
                          {option.text}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Navigation */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/10 backdrop-blur-sm p-4"
          >
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              {/* Prev Button */}
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  currentQuestionIndex === 0
                    ? "bg-white/10 text-white/30 cursor-not-allowed"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>

              {/* Progress Info */}
              <div className="text-center">
                <p className="text-white font-bold">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </p>
                <p className="text-white/70 text-sm font-semibold">
                  {answeredCount} of {totalQuestions} answered
                </p>
              </div>

              {/* Next / Finish Button */}
              {currentQuestionIndex === totalQuestions - 1 ? (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Finish</span>
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center space-x-2 px-6 py-3 bg-white/20 text-white rounded-xl font-bold hover:bg-white/30 transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Finish Exam Button (Always Visible) */}
            <div className="max-w-3xl mx-auto mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between">
                <p className="text-white/70 font-semibold">
                  Your Progress: {answeredCount} of {totalQuestions} questions
                  answered
                </p>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 py-2 bg-green-500/20 text-green-300 rounded-xl font-bold hover:bg-green-500/30 transition-all border border-green-500/50"
                >
                  Finish Exam
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${(answeredCount / totalQuestions) * 100}%`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSubmitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">
                  Submit Exam?
                </h2>
                <p className="text-gray-600 mb-4">
                  You have answered{" "}
                  <span className="font-bold text-indigo-600">
                    {answeredCount}
                  </span>{" "}
                  out of <span className="font-bold">{totalQuestions}</span>{" "}
                  questions.
                </p>

                {answeredCount < totalQuestions && (
                  <p className="text-orange-600 font-semibold mb-4">
                    ⚠️ You still have {totalQuestions - answeredCount}{" "}
                    unanswered question
                    {totalQuestions - answeredCount !== 1 ? "s" : ""}!
                  </p>
                )}

                {flaggedCount > 0 && (
                  <p className="text-orange-600 font-semibold mb-4">
                    ⭐ You have {flaggedCount} flagged question
                    {flaggedCount !== 1 ? "s" : ""} to review.
                  </p>
                )}

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 py-3 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Keep Working
                  </button>
                  <button
                    onClick={handleSubmitExam}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl font-bold bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-7xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">
                Great Job!
              </h2>
              <p className="text-gray-600 font-semibold mb-6">
                You've completed the exam! Let's see how you did.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleViewResults}
                className="w-full py-4 rounded-xl font-black text-lg bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg"
              >
                See My Results 📊
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// HELPERS
// ============================================

function formatQuestionText(text: string): string {
  if (!text) return "";
  // Handle any special formatting in question text
  return text
    .replace(/\\n/g, "\n")
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markers
    .trim();
}
