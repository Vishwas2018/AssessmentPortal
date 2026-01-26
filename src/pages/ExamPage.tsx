import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  HelpCircle,
  Loader2,
  Clock,
  Check,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Send,
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
  hint?: string;
}

interface Exam {
  id: string;
  title: string;
  duration_minutes: number;
  subject?: string;
  [key: string]: unknown;
}

// Helper functions
function cleanQuestionText(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/\\n/g, " ")
    .replace(/---/g, "\n\n")
    .replace(/\s+/g, " ")
    .trim();
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Floating shapes component for background
function FloatingShapes() {
  const shapes = [
    {
      type: "diamond",
      color: "bg-yellow-400",
      size: "w-3 h-3",
      top: "10%",
      left: "30%",
    },
    {
      type: "circle",
      color: "bg-blue-400",
      size: "w-2 h-2",
      top: "20%",
      left: "40%",
    },
    {
      type: "square",
      color: "bg-pink-400",
      size: "w-2 h-2",
      top: "15%",
      left: "85%",
    },
    {
      type: "diamond",
      color: "bg-green-400",
      size: "w-2 h-2",
      top: "25%",
      left: "90%",
    },
    {
      type: "circle",
      color: "bg-purple-400",
      size: "w-3 h-3",
      top: "8%",
      left: "60%",
    },
    {
      type: "square",
      color: "bg-orange-400",
      size: "w-2 h-2",
      top: "12%",
      left: "75%",
    },
    {
      type: "diamond",
      color: "bg-cyan-400",
      size: "w-2 h-2",
      top: "5%",
      left: "50%",
    },
    {
      type: "circle",
      color: "bg-red-400",
      size: "w-2 h-2",
      top: "18%",
      left: "70%",
    },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          className={`absolute ${shape.size} ${shape.color} ${
            shape.type === "diamond"
              ? "rotate-45"
              : shape.type === "circle"
                ? "rounded-full"
                : ""
          }`}
          style={{ top: shape.top, left: shape.left }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

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
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  // Fetch exam data
  useEffect(() => {
    async function fetchExamData() {
      console.log("=== FETCH EXAM DATA START ===");
      console.log("examId:", examId);
      console.log("attemptId:", attemptId);
      console.log("user:", user);

      if (!examId || !attemptId || !user) {
        console.error("Missing required data:", {
          examId,
          attemptId,
          user: !!user,
        });
        setError("Invalid exam session");
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
          console.error("Exam fetch error:", examError);
          setError("Exam not found");
          setIsLoading(false);
          return;
        }
        setExam(examData);

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .eq("exam_id", examId)
          .order("question_number", { ascending: true });

        if (questionsError || !questionsData || questionsData.length === 0) {
          console.error("Questions fetch error:", questionsError);
          setError("No questions found for this exam");
          setIsLoading(false);
          return;
        }
        setQuestions(questionsData);

        // Fetch attempt
        const { data: attemptData, error: attemptError } = await supabase
          .from("exam_attempts")
          .select("*")
          .eq("id", attemptId)
          .single();

        if (attemptError || !attemptData) {
          console.error("Attempt fetch error:", attemptError);
          setError("Exam session not found");
          setIsLoading(false);
          return;
        }

        // Restore answers if any
        if (attemptData.answers && typeof attemptData.answers === "object") {
          setAnswers(attemptData.answers as Record<string, string>);
        }

        // Calculate remaining time
        const startTime = new Date(attemptData.started_at).getTime();
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const totalSeconds = (examData.duration_minutes || 30) * 60;
        const remaining = Math.max(0, totalSeconds - elapsed);
        setTimeRemaining(remaining);
        setTotalTime(totalSeconds);

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching exam:", err);
        setError("Failed to load exam");
        setIsLoading(false);
      }
    }

    fetchExamData();
  }, [examId, attemptId, user]);

  // Timer countdown
  useEffect(() => {
    if (isLoading || timeRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
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

  // Reset hint when changing questions
  useEffect(() => {
    setShowHint(false);
  }, [currentIndex]);

  // Save answers to database
  const saveAnswers = useCallback(async () => {
    if (!attemptId) return;
    try {
      await supabase
        .from("exam_attempts")
        .update({
          answers,
        })
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

  // Handle Next/Finish button click
  const handleNextOrFinish = () => {
    if (isLastQuestion) {
      setShowSubmitModal(true);
    } else {
      goToQuestion(currentIndex + 1);
    }
  };

  // Submit exam
  const handleSubmit = async (isAutoSubmit = false) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setShowSubmitModal(false);

    try {
      // Calculate score
      let score = 0;
      let totalPoints = 0;

      questions.forEach((q) => {
        const points = q.points || 1;
        totalPoints += points;
        const userAnswer = answers[q.id];

        if (userAnswer && q.correct_answer) {
          const normalizedUserAnswer = userAnswer.trim().toUpperCase();
          const normalizedCorrectAnswer = q.correct_answer.trim().toUpperCase();

          let isCorrect = false;

          // Direct comparison
          if (normalizedUserAnswer === normalizedCorrectAnswer) {
            isCorrect = true;
          }
          // MCQ: Compare option text
          else if (
            q.question_type === "multiple_choice" &&
            q.options &&
            Array.isArray(q.options)
          ) {
            const letterCode = normalizedUserAnswer.charCodeAt(0);
            if (letterCode >= 65 && letterCode <= 90) {
              const optionIndex = letterCode - 65;
              const selectedOptionText = q.options[optionIndex];
              if (selectedOptionText) {
                const normalizedOptionText = selectedOptionText
                  .trim()
                  .toUpperCase();
                if (normalizedOptionText === normalizedCorrectAnswer) {
                  isCorrect = true;
                }
              }
            }
          }

          if (isCorrect) {
            score += points;
          }
        }
      });

      const percentage =
        totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
      const timeSpent = exam ? totalTime - timeRemaining : 0;

      // Update attempt in database
      const { error: updateError } = await supabase
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
        .eq("id", attemptId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Clear timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);

      // Show completion modal with confetti
      setShowCompletionModal(true);
    } catch (err) {
      console.error("Submit error:", err);
      setError("Failed to submit exam. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Get hint for current question
  const getHint = () => {
    if (!currentQuestion) return "";
    if (currentQuestion.hint) return currentQuestion.hint;
    if (currentQuestion.explanation) {
      const explanation = currentQuestion.explanation;
      if (explanation.length > 50) {
        return explanation.substring(0, 50) + "...";
      }
      return explanation;
    }
    return "Think carefully about this question!";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-indigo-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
          <p className="text-2xl font-bold">Loading your exam...</p>
          <p className="text-indigo-200 mt-2">Get ready to shine! ✨</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !exam || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-indigo-800 flex items-center justify-center p-4">
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

  const isAnswered = (qId: string) => answers[qId] !== undefined;
  const isFlagged = (qId: string) => flagged.has(qId);
  const flaggedCount = flagged.size;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-800 flex flex-col relative">
      <FloatingShapes />

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          {/* Timer Bar */}
          <div className="h-2 bg-indigo-900/30 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
              initial={{ width: "100%" }}
              animate={{ width: `${(timeRemaining / totalTime) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📐</span>
              <div>
                <h1 className="text-xl font-bold">
                  {exam.subject || exam.title}
                </h1>
                <div className="flex items-center gap-2 text-indigo-200">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-lg">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Sidebar + Question */}
      <div className="flex-1 relative z-10 px-6 pb-6">
        <div className="max-w-6xl mx-auto h-full flex gap-6">
          {/* Left Sidebar - Question Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-4">
              <h3 className="font-bold text-gray-700 mb-3 text-center">
                Questions
              </h3>

              {/* Stats */}
              <div className="flex justify-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">{answeredCount} Done</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-gray-600">{flaggedCount} Flagged</span>
                </div>
              </div>

              {/* Question Grid */}
              <div className="grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto">
                {questions.map((q, idx) => {
                  const answered = isAnswered(q.id);
                  const flaggedQ = isFlagged(q.id);
                  const isCurrent = idx === currentIndex;

                  return (
                    <motion.button
                      key={q.id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => goToQuestion(idx)}
                      className={`relative w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                        isCurrent
                          ? "bg-indigo-600 text-white ring-2 ring-indigo-300"
                          : answered
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {idx + 1}
                      {flaggedQ && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100"></div>
                  <span>Not answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-indigo-600"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-4 h-4 rounded bg-gray-100">
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full"></span>
                  </div>
                  <span>Flagged</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Question Card */}
          <div className="flex-1">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-xl h-full flex flex-col"
            >
              {/* Question Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-indigo-600">
                      {currentIndex + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-500">
                      Question {currentIndex + 1} of {totalQuestions}
                    </span>
                    {isFlagged(currentQuestion.id) && (
                      <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                        Flagged
                      </span>
                    )}
                  </div>
                  {isAnswered(currentQuestion.id) && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Question Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Question Text */}
                <div className="mb-6">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📝</span>
                    <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
                      {cleanQuestionText(currentQuestion.question_text)}
                    </h2>
                  </div>

                  {/* Question Image */}
                  {currentQuestion.image_url && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={currentQuestion.image_url}
                        alt="Question"
                        className="max-h-48 object-contain mx-auto"
                      />
                    </div>
                  )}
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelected = answers[currentQuestion.id] === letter;

                    return (
                      <motion.button
                        key={`${currentQuestion.id}-${idx}`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleAnswer(currentQuestion.id, letter)}
                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span
                          className={`flex-1 ${isSelected ? "text-indigo-700 font-medium" : "text-gray-700"}`}
                        >
                          {option}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Hint Section */}
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-4 bg-sky-50">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-sky-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sky-800">
                            Helpful Hint:
                          </p>
                          <p className="text-sky-700">{getHint()}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFlag(currentQuestion.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                        isFlagged(currentQuestion.id)
                          ? "bg-orange-100 text-orange-600 border-2 border-orange-200"
                          : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                      }`}
                    >
                      <Flag
                        className={`w-4 h-4 ${isFlagged(currentQuestion.id) ? "fill-current" : ""}`}
                      />
                      Flag
                    </button>
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                        showHint
                          ? "bg-sky-500 text-white"
                          : "bg-sky-100 text-sky-600 hover:bg-sky-200"
                      }`}
                    >
                      <HelpCircle className="w-4 h-4" />
                      Hint
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => goToQuestion(currentIndex - 1)}
                      disabled={currentIndex === 0}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                        currentIndex === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    {/* Next or Finish Button */}
                    <button
                      onClick={handleNextOrFinish}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                        isLastQuestion
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {isLastQuestion ? (
                        <>
                          Finish
                          <CheckCircle className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="relative z-10 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <span className="font-semibold text-gray-800">
                  Your Progress:{" "}
                </span>
                <span className="text-gray-600">
                  {answeredCount} of {totalQuestions} questions answered
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Finish Exam
                  <Check className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
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
            onClick={() => !isSubmitting && setShowSubmitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
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
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
                    <p className="text-amber-700 font-medium flex items-center justify-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      {totalQuestions - answeredCount} questions are still
                      unanswered!
                    </p>
                  </div>
                )}

                {flaggedCount > 0 && (
                  <p className="text-gray-500 mb-4">
                    You have{" "}
                    <span className="font-bold text-orange-500">
                      {flaggedCount}
                    </span>{" "}
                    flagged questions.
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Keep Working
                  </button>
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit!
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Modal with Confetti */}
      <AnimatePresence>
        {showCompletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-indigo-900/90 flex items-center justify-center z-50 p-4"
          >
            {/* Confetti */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-3 h-3 ${
                    [
                      "bg-yellow-400",
                      "bg-pink-500",
                      "bg-blue-500",
                      "bg-green-500",
                      "bg-purple-500",
                      "bg-orange-500",
                    ][i % 6]
                  }`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: "-20px",
                  }}
                  initial={{ y: -20, rotate: 0, opacity: 1 }}
                  animate={{
                    y: window.innerHeight + 20,
                    rotate: Math.random() * 720 - 360,
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    delay: Math.random() * 2,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative z-10"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-7xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Great Job!
              </h2>
              <p className="text-gray-600 mb-6">
                You've completed the {exam.subject || exam.title} exam!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/exam/${examId}/results/${attemptId}`)}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors"
              >
                See My Results
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
