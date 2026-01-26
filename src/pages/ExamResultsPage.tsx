import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  Home,
  RotateCcw,
  FileText,
  Star,
  Loader2,
  Filter,
  Award,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";

// Types
interface Question {
  id: string;
  question_number: number;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  points: number;
  image_url?: string;
  topic?: string;
}

interface ExamAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  status: string;
  started_at: string;
  completed_at: string;
  answers: Record<string, string>;
  score: number;
  total_points: number;
  percentage: number;
  time_spent_seconds: number;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  duration_minutes: number;
  total_questions: number;
}

type FilterType = "all" | "correct" | "incorrect" | "unanswered";

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
  return `${mins}m ${secs}s`;
}

function getGrade(percentage: number): {
  grade: string;
  color: string;
  emoji: string;
} {
  if (percentage >= 90)
    return { grade: "A+", color: "text-green-600", emoji: "🌟" };
  if (percentage >= 80)
    return { grade: "A", color: "text-green-500", emoji: "⭐" };
  if (percentage >= 70)
    return { grade: "B", color: "text-blue-500", emoji: "👍" };
  if (percentage >= 60)
    return { grade: "C", color: "text-yellow-500", emoji: "📚" };
  if (percentage >= 50)
    return { grade: "D", color: "text-orange-500", emoji: "💪" };
  return { grade: "F", color: "text-red-500", emoji: "📖" };
}

function getEncouragement(percentage: number): string {
  if (percentage >= 90) return "Outstanding! You're a superstar! 🌟";
  if (percentage >= 80) return "Excellent work! Keep it up! 🎉";
  if (percentage >= 70) return "Good job! You're doing great! 👏";
  if (percentage >= 60) return "Nice effort! Keep practicing! 💪";
  if (percentage >= 50) return "You're getting there! Don't give up! 🚀";
  return "Keep trying! Practice makes perfect! 📚";
}

// Question Result Card Component
interface QuestionCardProps {
  question: Question;
  userAnswer: string | undefined;
  isExpanded: boolean;
  onToggle: () => void;
  questionIndex: number;
}

function QuestionCard({
  question,
  userAnswer,
  isExpanded,
  onToggle,
  questionIndex,
}: QuestionCardProps) {
  const getAnswerStatus = () => {
    if (!userAnswer) return "unanswered";

    const normalizedUser = userAnswer.trim().toUpperCase();
    const normalizedCorrect = question.correct_answer.trim().toUpperCase();

    // Direct comparison
    if (normalizedUser === normalizedCorrect) return "correct";

    // MCQ: Compare option text
    if (question.options && Array.isArray(question.options)) {
      const letterCode = normalizedUser.charCodeAt(0);
      if (letterCode >= 65 && letterCode <= 90) {
        const optionIndex = letterCode - 65;
        const selectedOptionText = question.options[optionIndex];
        if (selectedOptionText) {
          const normalizedOptionText = selectedOptionText.trim().toUpperCase();
          if (normalizedOptionText === normalizedCorrect) return "correct";
        }
      }
    }

    return "incorrect";
  };

  const status = getAnswerStatus();
  const statusConfig = {
    correct: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      badge: "bg-green-100 text-green-700",
      label: "Correct",
    },
    incorrect: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      badge: "bg-red-100 text-red-700",
      label: "Incorrect",
    },
    unanswered: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: <MinusCircle className="w-5 h-5 text-yellow-500" />,
      badge: "bg-yellow-100 text-yellow-700",
      label: "Unanswered",
    },
  };

  const config = statusConfig[status];

  // Get the correct answer text
  const getCorrectAnswerText = () => {
    const correct = question.correct_answer.trim().toUpperCase();
    // If correct answer is a letter (A, B, C, D), get the option text
    if (
      correct.length === 1 &&
      correct >= "A" &&
      correct <= "Z" &&
      question.options
    ) {
      const idx = correct.charCodeAt(0) - 65;
      return question.options[idx] || question.correct_answer;
    }
    return question.correct_answer;
  };

  // Get user answer text
  const getUserAnswerText = () => {
    if (!userAnswer) return "Not answered";
    const answer = userAnswer.trim().toUpperCase();
    if (
      answer.length === 1 &&
      answer >= "A" &&
      answer <= "Z" &&
      question.options
    ) {
      const idx = answer.charCodeAt(0) - 65;
      return question.options[idx] || userAnswer;
    }
    return userAnswer;
  };

  return (
    <motion.div
      layout
      className={`rounded-2xl border-2 overflow-hidden ${config.border} ${config.bg}`}
    >
      {/* Question Header - Clickable */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-500">
              {questionIndex + 1}.
            </span>
            <span className="text-gray-800 font-medium line-clamp-1">
              {cleanQuestionText(question.question_text)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${config.badge}`}
          >
            {config.label}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Question Text */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">
                  {cleanQuestionText(question.question_text)}
                </h4>

                {/* Question Image */}
                {question.image_url && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={question.image_url}
                      alt="Question"
                      className="max-h-48 object-contain mx-auto"
                    />
                  </div>
                )}

                {/* Options */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Options:</p>
                  {question.options?.map((option, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isCorrect =
                      letter === question.correct_answer.trim().toUpperCase() ||
                      option.trim().toUpperCase() ===
                        question.correct_answer.trim().toUpperCase();
                    const isUserAnswer =
                      userAnswer?.trim().toUpperCase() === letter;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg flex items-center gap-3 ${
                          isCorrect
                            ? "bg-green-100 border-2 border-green-300"
                            : isUserAnswer && !isCorrect
                              ? "bg-red-100 border-2 border-red-300"
                              : "bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <span className="text-gray-700">{option}</span>
                        {isCorrect && (
                          <span className="ml-auto px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
                            Correct Answer
                          </span>
                        )}
                        {isUserAnswer && !isCorrect && (
                          <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
                            Your Answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Answer Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Your Answer:</p>
                  <p
                    className={`font-medium ${status === "unanswered" ? "text-gray-400 italic" : "text-gray-800"}`}
                  >
                    {getUserAnswerText()}
                  </p>
                </div>
                <div className="bg-green-100 rounded-xl p-4 border border-green-200">
                  <p className="text-sm text-green-700 mb-1">Correct Answer:</p>
                  <p className="font-medium text-green-800">
                    {getCorrectAnswerText()}
                  </p>
                </div>
              </div>

              {/* Explanation */}
              {question.explanation && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Explanation:
                  </p>
                  <p className="text-blue-700">{question.explanation}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Main Component
export default function ExamResultsPage() {
  const { examId, attemptId } = useParams<{
    examId: string;
    attemptId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // State
  const [exam, setExam] = useState<Exam | null>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "review">("summary");
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set(),
  );

  // Fetch data
  useEffect(() => {
    async function fetchResults() {
      if (!examId || !attemptId || !user) {
        setError("Invalid results page");
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

        if (examError) throw examError;
        setExam(examData);

        // Fetch attempt
        const { data: attemptData, error: attemptError } = await supabase
          .from("exam_attempts")
          .select("*")
          .eq("id", attemptId)
          .single();

        if (attemptError) throw attemptError;
        setAttempt(attemptData);

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .eq("exam_id", examId)
          .order("question_number", { ascending: true });

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("Failed to load results");
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [examId, attemptId, user]);

  // Calculate statistics
  const getQuestionStatus = (question: Question) => {
    if (!attempt) return "unanswered";
    const userAnswer = attempt.answers[question.id];
    if (!userAnswer) return "unanswered";

    const normalizedUser = userAnswer.trim().toUpperCase();
    const normalizedCorrect = question.correct_answer.trim().toUpperCase();

    if (normalizedUser === normalizedCorrect) return "correct";

    if (question.options && Array.isArray(question.options)) {
      const letterCode = normalizedUser.charCodeAt(0);
      if (letterCode >= 65 && letterCode <= 90) {
        const optionIndex = letterCode - 65;
        const selectedOptionText = question.options[optionIndex];
        if (selectedOptionText) {
          const normalizedOptionText = selectedOptionText.trim().toUpperCase();
          if (normalizedOptionText === normalizedCorrect) return "correct";
        }
      }
    }

    return "incorrect";
  };

  const stats = {
    correct: questions.filter((q) => getQuestionStatus(q) === "correct").length,
    incorrect: questions.filter((q) => getQuestionStatus(q) === "incorrect")
      .length,
    unanswered: questions.filter((q) => getQuestionStatus(q) === "unanswered")
      .length,
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    if (filter === "all") return true;
    return getQuestionStatus(q) === filter;
  });

  // Toggle question expansion
  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700">
            Loading your results...
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !exam || !attempt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">
            {error || "Unable to load results"}
          </p>
          <button
            onClick={() => navigate("/exams")}
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  const gradeInfo = getGrade(attempt.percentage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/exams"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Back to Exams</span>
            </Link>
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "summary"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                RESULTS SUMMARY
              </button>
              <button
                onClick={() => setActiveTab("review")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "review"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                QUESTION REVIEW
              </button>
            </div>
            <div className="w-32" /> {/* Spacer for alignment */}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "summary" ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Score Card */}
              <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="text-8xl mb-4"
                >
                  {gradeInfo.emoji}
                </motion.div>

                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {exam.subject || exam.title} Results
                </h1>

                <p className="text-gray-600 mb-6">
                  {getEncouragement(attempt.percentage)}
                </p>

                {/* Score Circle */}
                <div className="relative w-48 h-48 mx-auto mb-8">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke={attempt.percentage >= 50 ? "#22c55e" : "#ef4444"}
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 553" }}
                      animate={{
                        strokeDasharray: `${(attempt.percentage / 100) * 553} 553`,
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-bold ${gradeInfo.color}`}>
                      {attempt.percentage}%
                    </span>
                    <span className="text-gray-500">Score</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-green-50 rounded-2xl p-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-green-600">
                      {stats.correct}
                    </p>
                    <p className="text-green-700 text-sm">Correct</p>
                  </div>
                  <div className="bg-red-50 rounded-2xl p-4">
                    <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-red-600">
                      {stats.incorrect}
                    </p>
                    <p className="text-red-700 text-sm">Incorrect</p>
                  </div>
                  <div className="bg-yellow-50 rounded-2xl p-4">
                    <MinusCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-yellow-600">
                      {stats.unanswered}
                    </p>
                    <p className="text-yellow-700 text-sm">Unanswered</p>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 rounded-2xl p-4 flex items-center gap-4">
                    <Clock className="w-10 h-10 text-indigo-500" />
                    <div className="text-left">
                      <p className="text-sm text-indigo-600">Time Spent</p>
                      <p className="text-xl font-bold text-indigo-800">
                        {formatTime(attempt.time_spent_seconds)}
                      </p>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-4 flex items-center gap-4">
                    <Target className="w-10 h-10 text-purple-500" />
                    <div className="text-left">
                      <p className="text-sm text-purple-600">Points Earned</p>
                      <p className="text-xl font-bold text-purple-800">
                        {attempt.score} / {attempt.total_points}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("review")}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Review Answers
                </button>
                <Link
                  to="/exams"
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Another Exam
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Question Review
                </h2>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === "all"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  All Questions
                </button>
                <button
                  onClick={() => setFilter("correct")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === "correct"
                      ? "bg-green-600 text-white"
                      : "bg-white text-green-600 border border-green-200 hover:bg-green-50"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Correct ({stats.correct})
                </button>
                <button
                  onClick={() => setFilter("incorrect")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === "incorrect"
                      ? "bg-red-600 text-white"
                      : "bg-white text-red-600 border border-red-200 hover:bg-red-50"
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Incorrect ({stats.incorrect})
                </button>
                <button
                  onClick={() => setFilter("unanswered")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === "unanswered"
                      ? "bg-yellow-600 text-white"
                      : "bg-white text-yellow-600 border border-yellow-200 hover:bg-yellow-50"
                  }`}
                >
                  <MinusCircle className="w-4 h-4" />
                  Unanswered ({stats.unanswered})
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {filteredQuestions.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center">
                    <div className="text-5xl mb-4">🔍</div>
                    <p className="text-gray-600">
                      No questions match this filter
                    </p>
                  </div>
                ) : (
                  filteredQuestions.map((question, idx) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      userAnswer={attempt.answers[question.id]}
                      isExpanded={expandedQuestions.has(question.id)}
                      onToggle={() => toggleQuestion(question.id)}
                      questionIndex={questions.findIndex(
                        (q) => q.id === question.id,
                      )}
                    />
                  ))
                )}
              </div>

              {/* Back to Summary */}
              <div className="text-center pt-4">
                <button
                  onClick={() => setActiveTab("summary")}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Back to Summary
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
