// src/pages/ExamResultsPage.tsx
// Comprehensive results page with:
// - Score summary with grade
// - Performance comparison to national average
// - Topic-based performance analysis with charts
// - Difficulty-based breakdown
// - Question-by-question review with explanations
// - Personalized improvement plan
// - Additional practice resources
// ============================================

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  BarChart3,
  PieChart,
  Award,
  Star,
  Lightbulb,
  ArrowRight,
  Download,
  Share2,
  Home,
  RotateCcw,
  FileText,
  Brain,
  Zap,
  Shield,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: unknown;
  correct_answer: string;
  explanation?: string;
  points: number;
  question_number: number;
  topic?: string;
  difficulty?: string;
}

interface ExamAttempt {
  id: string;
  exam_id: string;
  score: number;
  answers: Record<string, string>;
  completed_at: string;
  time_taken: number;
  tab_switches?: number;
  violations?: Array<{ type: string; timestamp: string }>;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  year_level: number;
  duration_minutes: number;
  total_marks: number;
}

// Topic categories for NAPLAN
const TOPIC_MAPPING: Record<string, string> = {
  money: "Number & Algebra",
  calculation: "Number & Algebra",
  pattern: "Number & Algebra",
  fraction: "Number & Algebra",
  decimal: "Number & Algebra",
  percentage: "Number & Algebra",
  ratio: "Number & Algebra",
  place: "Number & Algebra",
  multiply: "Number & Algebra",
  divide: "Number & Algebra",
  time: "Measurement & Geometry",
  perimeter: "Measurement & Geometry",
  area: "Measurement & Geometry",
  volume: "Measurement & Geometry",
  angle: "Measurement & Geometry",
  shape: "Measurement & Geometry",
  net: "Measurement & Geometry",
  symmetry: "Measurement & Geometry",
  transform: "Measurement & Geometry",
  grid: "Measurement & Geometry",
  map: "Measurement & Geometry",
  graph: "Statistics & Probability",
  data: "Statistics & Probability",
  tally: "Statistics & Probability",
  probability: "Statistics & Probability",
  chance: "Statistics & Probability",
  spinner: "Statistics & Probability",
  average: "Statistics & Probability",
  balance: "Number & Algebra",
  equation: "Number & Algebra",
  scale: "Measurement & Geometry",
};

// National average data (simulated)
const NATIONAL_AVERAGES: Record<number, number> = {
  3: 65,
  5: 62,
  7: 58,
  9: 55,
};

export default function ExamResultsPage() {
  const { examId, attemptId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "questions" | "analysis" | "improve"
  >("overview");

  useEffect(() => {
    const fetchResults = async () => {
      if (!examId || !attemptId) return;

      try {
        const [examRes, attemptRes, questionsRes] = await Promise.all([
          supabase.from("exams").select("*").eq("id", examId).single(),
          supabase
            .from("exam_attempts")
            .select("*")
            .eq("id", attemptId)
            .single(),
          supabase
            .from("questions")
            .select("*")
            .eq("exam_id", examId)
            .order("question_number"),
        ]);

        if (examRes.data) setExam(examRes.data);
        if (attemptRes.data) setAttempt(attemptRes.data);
        if (questionsRes.data) setQuestions(questionsRes.data);
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [examId, attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!exam || !attempt || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <p className="text-xl text-gray-700 mb-4">Results not found</p>
          <Link
            to="/exams"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Back to Exams
          </Link>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const score = attempt.score;
  const totalQuestions = questions.length;

  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  const questionResults = questions.map((q) => {
    const userAnswer = attempt.answers[q.id] || "";
    const isCorrect =
      userAnswer &&
      q.correct_answer &&
      userAnswer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
    const isSkipped = !userAnswer;

    if (isCorrect) correctCount++;
    else if (isSkipped) skippedCount++;
    else incorrectCount++;

    return {
      ...q,
      userAnswer,
      isCorrect: !!isCorrect,
      isSkipped,
    };
  });

  // Grade calculation
  const getGrade = (
    score: number,
  ): { grade: string; color: string; emoji: string } => {
    if (score >= 90)
      return { grade: "A+", color: "text-emerald-600", emoji: "🌟" };
    if (score >= 80)
      return { grade: "A", color: "text-emerald-500", emoji: "⭐" };
    if (score >= 70) return { grade: "B", color: "text-blue-500", emoji: "👍" };
    if (score >= 60)
      return { grade: "C", color: "text-yellow-500", emoji: "📚" };
    if (score >= 50)
      return { grade: "D", color: "text-orange-500", emoji: "💪" };
    return { grade: "E", color: "text-red-500", emoji: "📖" };
  };

  const gradeInfo = getGrade(score);
  const nationalAverage = NATIONAL_AVERAGES[exam.year_level] || 60;
  const comparisonToAvg = score - nationalAverage;

  // Topic-based analysis
  const topicAnalysis: Record<
    string,
    { correct: number; total: number; questions: typeof questionResults }
  > = {};

  questionResults.forEach((q) => {
    // Determine topic from question text
    const text = q.question_text.toLowerCase();
    let topic = "General";

    for (const [keyword, topicName] of Object.entries(TOPIC_MAPPING)) {
      if (text.includes(keyword)) {
        topic = topicName;
        break;
      }
    }

    if (!topicAnalysis[topic]) {
      topicAnalysis[topic] = { correct: 0, total: 0, questions: [] };
    }
    topicAnalysis[topic].total++;
    topicAnalysis[topic].questions.push(q);
    if (q.isCorrect) topicAnalysis[topic].correct++;
  });

  // Difficulty analysis (based on question position - early = easier)
  const difficultyAnalysis = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
  };

  questionResults.forEach((q, index) => {
    const difficulty =
      index < totalQuestions * 0.33
        ? "easy"
        : index < totalQuestions * 0.66
          ? "medium"
          : "hard";
    difficultyAnalysis[difficulty].total++;
    if (q.isCorrect) difficultyAnalysis[difficulty].correct++;
  });

  // Time analysis
  const examDuration = exam.duration_minutes * 60;
  const timeUsed = examDuration - (attempt.time_taken || 0);
  const timePerQuestion = Math.round(timeUsed / totalQuestions);
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Improvement recommendations
  const getRecommendations = () => {
    const recs: Array<{
      icon: JSX.Element;
      title: string;
      description: string;
      priority: "high" | "medium" | "low";
    }> = [];

    // Check weakest topics
    const sortedTopics = Object.entries(topicAnalysis)
      .map(([topic, data]) => ({
        topic,
        percentage: Math.round((data.correct / data.total) * 100),
      }))
      .sort((a, b) => a.percentage - b.percentage);

    if (sortedTopics.length > 0 && sortedTopics[0].percentage < 60) {
      recs.push({
        icon: <Target className="w-5 h-5" />,
        title: `Focus on ${sortedTopics[0].topic}`,
        description: `You scored ${sortedTopics[0].percentage}% in this area. Practice more questions in this topic.`,
        priority: "high",
      });
    }

    // Check if too many skipped
    if (skippedCount > totalQuestions * 0.1) {
      recs.push({
        icon: <Clock className="w-5 h-5" />,
        title: "Time Management",
        description: `You skipped ${skippedCount} questions. Try to attempt all questions, even if unsure.`,
        priority: "high",
      });
    }

    // Check difficulty pattern
    if (difficultyAnalysis.easy.total > 0) {
      const easyPercent = Math.round(
        (difficultyAnalysis.easy.correct / difficultyAnalysis.easy.total) * 100,
      );
      if (easyPercent < 80) {
        recs.push({
          icon: <BookOpen className="w-5 h-5" />,
          title: "Review Fundamentals",
          description:
            "Focus on basic concepts before moving to harder questions.",
          priority: "high",
        });
      }
    }

    // Tab switches warning
    if (attempt.tab_switches && attempt.tab_switches > 2) {
      recs.push({
        icon: <Shield className="w-5 h-5" />,
        title: "Stay Focused",
        description: `You switched tabs ${attempt.tab_switches} times. Try to stay focused during exams.`,
        priority: "medium",
      });
    }

    // Positive feedback
    if (score >= 70) {
      recs.push({
        icon: <Star className="w-5 h-5" />,
        title: "Great Progress!",
        description:
          "Keep up the good work. Try more challenging practice tests.",
        priority: "low",
      });
    }

    // Time efficiency
    if (timePerQuestion < 30) {
      recs.push({
        icon: <Zap className="w-5 h-5" />,
        title: "Slow Down",
        description:
          "You're answering very quickly. Take more time to read questions carefully.",
        priority: "medium",
      });
    }

    return recs;
  };

  const recommendations = getRecommendations();

  // Parse options helper
  const parseOptions = (options: unknown): string[] => {
    if (!options) return [];
    if (Array.isArray(options))
      return options.map((o) =>
        typeof o === "string" ? o : o?.text || o?.value || "",
      );
    if (typeof options === "string") {
      try {
        const p = JSON.parse(options);
        return Array.isArray(p) ? parseOptions(p) : [options];
      } catch {
        return options.includes(",")
          ? options.split(",").map((s) => s.trim())
          : [options];
      }
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600"
            >
              <Home className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-xl text-gray-800">Exam Results</h1>
              <p className="text-sm text-gray-500">{exam.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <Link
              to="/exams"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <RotateCcw className="w-4 h-4" /> Try Another Exam
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Score Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 text-white mb-8"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Score Circle */}
            <div className="flex items-center gap-8">
              <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="white"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * score) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold">{score}%</span>
                  <span className="text-white/80">Score</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-6xl font-bold">{gradeInfo.grade}</span>
                  <span className="text-4xl">{gradeInfo.emoji}</span>
                </div>
                <p className="text-white/80 text-lg">
                  {score >= 80
                    ? "Excellent work!"
                    : score >= 60
                      ? "Good effort!"
                      : "Keep practicing!"}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-300" />
                <p className="text-2xl font-bold">{correctCount}</p>
                <p className="text-white/70 text-sm">Correct</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <XCircle className="w-8 h-8 mx-auto mb-2 text-red-300" />
                <p className="text-2xl font-bold">{incorrectCount}</p>
                <p className="text-white/70 text-sm">Incorrect</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                <p className="text-2xl font-bold">{skippedCount}</p>
                <p className="text-white/70 text-sm">Skipped</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                <p className="text-2xl font-bold">{formatDuration(timeUsed)}</p>
                <p className="text-white/70 text-sm">Time Used</p>
              </div>
            </div>
          </div>

          {/* National Average Comparison */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <BarChart3 className="w-6 h-6" />
                <div>
                  <p className="font-medium">Compared to National Average</p>
                  <p className="text-white/70 text-sm">
                    Year {exam.year_level} NAPLAN Average: {nationalAverage}%
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${comparisonToAvg >= 0 ? "bg-green-500/30" : "bg-red-500/30"}`}
              >
                {comparisonToAvg >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                <span className="font-bold">
                  {comparisonToAvg >= 0 ? "+" : ""}
                  {comparisonToAvg}%
                </span>
                <span className="text-white/70">
                  {comparisonToAvg >= 0 ? "above" : "below"} average
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 shadow-sm">
          {[
            {
              id: "overview",
              label: "Overview",
              icon: <PieChart className="w-4 h-4" />,
            },
            {
              id: "questions",
              label: "Question Review",
              icon: <FileText className="w-4 h-4" />,
            },
            {
              id: "analysis",
              label: "Analysis",
              icon: <BarChart3 className="w-4 h-4" />,
            },
            {
              id: "improve",
              label: "Improve",
              icon: <Lightbulb className="w-4 h-4" />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Topic Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Performance by Topic
              </h3>
              <div className="space-y-4">
                {Object.entries(topicAnalysis).map(([topic, data]) => {
                  const percentage = Math.round(
                    (data.correct / data.total) * 100,
                  );
                  return (
                    <div key={topic}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">
                          {topic}
                        </span>
                        <span
                          className={`font-semibold ${percentage >= 70 ? "text-green-600" : percentage >= 50 ? "text-yellow-600" : "text-red-600"}`}
                        >
                          {percentage}% ({data.correct}/{data.total})
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className={`h-full rounded-full ${
                            percentage >= 70
                              ? "bg-green-500"
                              : percentage >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Difficulty Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-600" />
                Performance by Difficulty
              </h3>
              <div className="space-y-4">
                {Object.entries(difficultyAnalysis).map(
                  ([difficulty, data]) => {
                    const percentage =
                      data.total > 0
                        ? Math.round((data.correct / data.total) * 100)
                        : 0;
                    const labels: Record<
                      string,
                      { label: string; color: string }
                    > = {
                      easy: { label: "Easy Questions", color: "bg-green-500" },
                      medium: {
                        label: "Medium Questions",
                        color: "bg-yellow-500",
                      },
                      hard: { label: "Hard Questions", color: "bg-red-500" },
                    };
                    return (
                      <div key={difficulty}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 font-medium">
                            {labels[difficulty].label}
                          </span>
                          <span className="font-semibold text-gray-800">
                            {percentage}% ({data.correct}/{data.total})
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className={`h-full rounded-full ${labels[difficulty].color}`}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </motion.div>

            {/* Time Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Time Analysis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-indigo-600">
                    {formatDuration(timeUsed)}
                  </p>
                  <p className="text-sm text-gray-500">Total Time Used</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-indigo-600">
                    {timePerQuestion}s
                  </p>
                  <p className="text-sm text-gray-500">Avg per Question</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-indigo-600">
                    {formatDuration(attempt.time_taken || 0)}
                  </p>
                  <p className="text-sm text-gray-500">Time Remaining</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-indigo-600">
                    {exam.duration_minutes}m
                  </p>
                  <p className="text-sm text-gray-500">Total Allowed</p>
                </div>
              </div>
            </motion.div>

            {/* Integrity Report */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Exam Integrity
              </h3>
              <div className="space-y-3">
                <div
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    (attempt.tab_switches || 0) === 0
                      ? "bg-green-50"
                      : "bg-yellow-50"
                  }`}
                >
                  <span className="text-gray-700">Tab Switches</span>
                  <span
                    className={`font-semibold ${
                      (attempt.tab_switches || 0) === 0
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {attempt.tab_switches || 0}
                  </span>
                </div>
                <div
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    (attempt.violations?.length || 0) === 0
                      ? "bg-green-50"
                      : "bg-red-50"
                  }`}
                >
                  <span className="text-gray-700">Violations Detected</span>
                  <span
                    className={`font-semibold ${
                      (attempt.violations?.length || 0) === 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {attempt.violations?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                  <span className="text-gray-700">Exam Completed</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === "questions" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Filter:</span>
                <button className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700">
                  All ({totalQuestions})
                </button>
                <button className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                  Correct ({correctCount})
                </button>
                <button className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
                  Incorrect ({incorrectCount})
                </button>
                <button className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
                  Skipped ({skippedCount})
                </button>
              </div>
            </div>

            <div className="divide-y">
              {questionResults.map((q, index) => (
                <div key={q.id} className="p-4">
                  <button
                    onClick={() =>
                      setExpandedQuestion(
                        expandedQuestion === q.id ? null : q.id,
                      )
                    }
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          q.isCorrect
                            ? "bg-green-100 text-green-700"
                            : q.isSkipped
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="text-left">
                        <p className="font-medium text-gray-800">
                          Question {index + 1}
                        </p>
                        <p className="text-sm text-gray-500">
                          {q.isCorrect
                            ? "✓ Correct"
                            : q.isSkipped
                              ? "○ Skipped"
                              : "✗ Incorrect"}
                          {q.userAnswer &&
                            !q.isSkipped &&
                            ` • Your answer: ${q.userAnswer}`}
                        </p>
                      </div>
                    </div>
                    {expandedQuestion === q.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedQuestion === q.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 pl-14"
                    >
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-500 mb-2">Question:</p>
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: q.question_text }}
                        />
                      </div>

                      {q.question_type === "multiple_choice" && (
                        <div className="space-y-2 mb-4">
                          {parseOptions(q.options).map((opt, i) => {
                            const letter = ["A", "B", "C", "D", "E", "F"][i];
                            const isUserAnswer = q.userAnswer === letter;
                            const isCorrectAnswer = q.correct_answer === letter;
                            return (
                              <div
                                key={i}
                                className={`p-3 rounded-lg border-2 flex items-center gap-3 ${
                                  isCorrectAnswer
                                    ? "border-green-500 bg-green-50"
                                    : isUserAnswer && !q.isCorrect
                                      ? "border-red-500 bg-red-50"
                                      : "border-gray-200"
                                }`}
                              >
                                <span
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                                    isCorrectAnswer
                                      ? "bg-green-500 text-white"
                                      : isUserAnswer
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {letter}
                                </span>
                                <span
                                  className="flex-1"
                                  dangerouslySetInnerHTML={{ __html: opt }}
                                />
                                {isCorrectAnswer && (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {q.question_type === "short_answer" && (
                        <div className="mb-4 space-y-2">
                          <div
                            className={`p-3 rounded-lg ${q.isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                          >
                            <p className="text-sm text-gray-500">
                              Your answer:
                            </p>
                            <p
                              className={`font-medium ${q.isCorrect ? "text-green-700" : "text-red-700"}`}
                            >
                              {q.userAnswer || "(No answer)"}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                            <p className="text-sm text-gray-500">
                              Correct answer:
                            </p>
                            <p className="font-medium text-green-700">
                              {q.correct_answer}
                            </p>
                          </div>
                        </div>
                      )}

                      {q.explanation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-blue-800 mb-1 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" /> Explanation
                          </p>
                          <p className="text-sm text-blue-700">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "analysis" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual Chart - Topic Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-4">
                Topic Score Distribution
              </h3>
              <div className="flex items-end justify-around h-64 pt-8">
                {Object.entries(topicAnalysis).map(([topic, data], index) => {
                  const percentage = Math.round(
                    (data.correct / data.total) * 100,
                  );
                  const colors = [
                    "bg-indigo-500",
                    "bg-purple-500",
                    "bg-pink-500",
                    "bg-blue-500",
                  ];
                  return (
                    <div
                      key={topic}
                      className="flex flex-col items-center gap-2"
                    >
                      <span className="text-sm font-semibold">
                        {percentage}%
                      </span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${percentage * 2}px` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className={`w-16 ${colors[index % colors.length]} rounded-t-lg`}
                      />
                      <span className="text-xs text-gray-500 text-center w-20 truncate">
                        {topic.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Performance Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-4">
                Question-by-Question Performance
              </h3>
              <div className="flex items-end gap-1 h-48 overflow-x-auto pb-4">
                {questionResults.map((q, index) => (
                  <div
                    key={q.id}
                    className={`w-4 min-w-[16px] rounded-t transition-all hover:opacity-80 ${
                      q.isCorrect
                        ? "bg-green-500 h-full"
                        : q.isSkipped
                          ? "bg-yellow-400 h-1/2"
                          : "bg-red-500 h-1/4"
                    }`}
                    title={`Q${index + 1}: ${q.isCorrect ? "Correct" : q.isSkipped ? "Skipped" : "Incorrect"}`}
                  />
                ))}
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded" /> Correct
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-yellow-400 rounded" /> Skipped
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded" /> Incorrect
                </span>
              </div>
            </motion.div>

            {/* Strengths */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" /> Your Strengths
              </h3>
              <div className="space-y-3">
                {Object.entries(topicAnalysis)
                  .filter(([_, data]) => data.correct / data.total >= 0.7)
                  .map(([topic, data]) => (
                    <div
                      key={topic}
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">{topic}</p>
                        <p className="text-sm text-green-600">
                          {Math.round((data.correct / data.total) * 100)}%
                          correct
                        </p>
                      </div>
                    </div>
                  ))}
                {Object.entries(topicAnalysis).filter(
                  ([_, data]) => data.correct / data.total >= 0.7,
                ).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Keep practicing to identify your strengths!
                  </p>
                )}
              </div>
            </motion.div>

            {/* Areas to Improve */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" /> Areas to Improve
              </h3>
              <div className="space-y-3">
                {Object.entries(topicAnalysis)
                  .filter(([_, data]) => data.correct / data.total < 0.6)
                  .map(([topic, data]) => (
                    <div
                      key={topic}
                      className="flex items-center gap-3 p-3 bg-red-50 rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-800">{topic}</p>
                        <p className="text-sm text-red-600">
                          {Math.round((data.correct / data.total) * 100)}%
                          correct - needs practice
                        </p>
                      </div>
                    </div>
                  ))}
                {Object.entries(topicAnalysis).filter(
                  ([_, data]) => data.correct / data.total < 0.6,
                ).length === 0 && (
                  <p className="text-green-600 text-center py-4">
                    Great job! No major weak areas identified.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === "improve" && (
          <div className="space-y-6">
            {/* Personalized Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" /> Personalized
                Improvement Plan
              </h3>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      rec.priority === "high"
                        ? "border-red-500 bg-red-50"
                        : rec.priority === "medium"
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-green-500 bg-green-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          rec.priority === "high"
                            ? "bg-red-100 text-red-600"
                            : rec.priority === "medium"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-green-100 text-green-600"
                        }`}
                      >
                        {rec.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {rec.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Practice Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" /> Recommended
                Practice
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(topicAnalysis)
                  .filter(([_, data]) => data.correct / data.total < 0.7)
                  .slice(0, 3)
                  .map(([topic]) => (
                    <Link
                      key={topic}
                      to={`/exams?topic=${encodeURIComponent(topic)}`}
                      className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">
                          {topic}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition" />
                      </div>
                      <p className="text-sm text-gray-500">
                        Practice more questions in this topic
                      </p>
                    </Link>
                  ))}
                <Link
                  to="/exams"
                  className="p-4 border-2 border-dashed border-indigo-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition group bg-indigo-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-indigo-700">
                      Browse All Exams
                    </span>
                    <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition" />
                  </div>
                  <p className="text-sm text-indigo-600">
                    Find more practice tests
                  </p>
                </Link>
              </div>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white"
            >
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" /> Ready for Your Next Challenge?
              </h3>
              <p className="text-white/80 mb-6">
                Based on your performance, we recommend trying a{" "}
                {score >= 70 ? "harder" : "similar"} practice test to continue
                improving.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/exams"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition"
                >
                  <RotateCcw className="w-4 h-4" /> Try Another Exam
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition"
                >
                  <Home className="w-4 h-4" /> Go to Dashboard
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
