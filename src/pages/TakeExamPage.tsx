// src/pages/TakeExamPage.tsx
// Enhanced exam page - uses ONLY basic columns that exist
// Columns used: answers, flagged, score, completed_at, status
// ============================================

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle,
  AlertCircle,
  Send,
  AlertTriangle,
  Save,
  Accessibility,
  Shield,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: unknown;
  correct_answer: string;
  points: number;
  question_number: number;
}

interface ViolationLog {
  type: string;
  timestamp: string;
}

export default function TakeExamPage() {
  const { examId, attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Core state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(3000);
  const [loading, setLoading] = useState(true);
  const [examTitle, setExamTitle] = useState("");
  const [examDuration, setExamDuration] = useState(50);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [shortAnswer, setShortAnswer] = useState("");

  // Anti-cheating state (local only - not saved to DB)
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [violations, setViolations] = useState<ViolationLog[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // Auto-save state
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">(
    "saved",
  );
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false);

  // Accessibility state
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">(
    "normal",
  );
  const [highContrast, setHighContrast] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  // ============================================
  // ANTI-CHEATING MEASURES (Local only)
  // ============================================

  const logViolation = useCallback((type: string) => {
    setViolations((prev) => [
      ...prev,
      { type, timestamp: new Date().toISOString() },
    ]);

    if (type === "tab_switch") {
      setTabSwitchCount((prev) => prev + 1);
    }

    const messages: Record<string, string> = {
      tab_switch: "⚠️ Tab switch detected! Stay on this page.",
      copy: "⚠️ Copying is not allowed.",
      paste: "⚠️ Pasting is not allowed.",
      right_click: "⚠️ Right-click is disabled.",
    };
    setWarningMessage(messages[type] || "⚠️ Activity detected.");
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 3000);
  }, []);

  // Tab visibility detection
  useEffect(() => {
    const handler = () => {
      if (document.hidden) logViolation("tab_switch");
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [logViolation]);

  // Block keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && ["c", "v", "a", "p"].includes(e.key.toLowerCase())) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        logViolation(
          e.key.toLowerCase() === "c"
            ? "copy"
            : e.key.toLowerCase() === "v"
              ? "paste"
              : "other",
        );
      }
      // Accessibility navigation
      if (accessibilityMode) {
        if (e.key === "ArrowRight" && currentIndex < totalQuestions - 1)
          setCurrentIndex((p) => p + 1);
        else if (e.key === "ArrowLeft" && currentIndex > 0)
          setCurrentIndex((p) => p - 1);
        else if (
          e.key >= "1" &&
          e.key <= "4" &&
          currentQuestion?.question_type === "multiple_choice"
        ) {
          handleAnswerSelect(["A", "B", "C", "D"][parseInt(e.key) - 1]);
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [
    logViolation,
    accessibilityMode,
    currentIndex,
    totalQuestions,
    currentQuestion,
  ]);

  // Block right-click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      logViolation("right_click");
    };
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, [logViolation]);

  // Block copy/paste
  useEffect(() => {
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation("copy");
    };
    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation("paste");
    };
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
    };
  }, [logViolation]);

  // ============================================
  // AUTO-SAVE (Only answers and flagged)
  // ============================================

  const saveProgress = useCallback(async () => {
    if (!attemptId || !hasLoadedRef.current) return;

    setSaveStatus("saving");
    try {
      // ONLY save answers and flagged - these columns definitely exist
      const { error } = await supabase
        .from("exam_attempts")
        .update({
          answers: answers,
          flagged: Array.from(flagged),
        })
        .eq("id", attemptId);

      if (error) {
        console.error("Save error:", error);
        setSaveStatus("error");
      } else {
        setSaveStatus("saved");
      }
    } catch (error) {
      console.error("Save exception:", error);
      setSaveStatus("error");
    }
  }, [attemptId, answers, flagged]);

  // Debounced auto-save on answer change
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(saveProgress, 2000);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [answers, flagged, saveProgress]);

  // ============================================
  // FETCH EXAM DATA
  // ============================================

  useEffect(() => {
    const fetchExamData = async () => {
      if (!examId || !attemptId) return;

      try {
        // Fetch exam
        const { data: exam, error: examError } = await supabase
          .from("exams")
          .select("*")
          .eq("id", examId)
          .single();

        if (examError) {
          console.error("Exam fetch error:", examError);
          return;
        }

        if (exam) {
          setExamTitle(exam.title);
          setExamDuration(exam.duration_minutes);
          setTimeRemaining(exam.duration_minutes * 60);
        }

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .eq("exam_id", examId)
          .order("question_number");

        if (questionsError) {
          console.error("Questions fetch error:", questionsError);
          return;
        }

        setQuestions(questionsData || []);

        // Fetch attempt
        const { data: attempt, error: attemptError } = await supabase
          .from("exam_attempts")
          .select("*")
          .eq("id", attemptId)
          .single();

        if (attemptError) {
          console.error("Attempt fetch error:", attemptError);
        }

        if (attempt) {
          if (attempt.answers && typeof attempt.answers === "object") {
            setAnswers(attempt.answers);
          }
          if (attempt.flagged && Array.isArray(attempt.flagged)) {
            setFlagged(new Set(attempt.flagged));
          }
        }

        // Mark as loaded so auto-save can start
        hasLoadedRef.current = true;
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId, attemptId]);

  // Update short answer when question changes
  useEffect(() => {
    if (currentQuestion?.question_type === "short_answer") {
      setShortAnswer(answers[currentQuestion.id] || "");
    }
  }, [currentIndex, currentQuestion, answers]);

  // Timer
  useEffect(() => {
    if (loading || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, timeRemaining]);

  // ============================================
  // HANDLERS
  // ============================================

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

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

  const handleAnswerSelect = (answer: string) => {
    if (currentQuestion)
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const handleShortAnswer = (value: string) => {
    setShortAnswer(value);
    if (currentQuestion)
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const toggleFlag = () => {
    if (!currentQuestion) return;
    setFlagged((prev) => {
      const s = new Set(prev);
      s.has(currentQuestion.id)
        ? s.delete(currentQuestion.id)
        : s.add(currentQuestion.id);
      return s;
    });
  };

  const goTo = (i: number) =>
    i >= 0 && i < totalQuestions && setCurrentIndex(i);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // Calculate score
      let total = 0,
        earned = 0;
      questions.forEach((q) => {
        total += q.points || 1;
        const userAnswer = answers[q.id] || "";
        const isCorrect =
          userAnswer &&
          q.correct_answer &&
          userAnswer.trim().toLowerCase() ===
            q.correct_answer.trim().toLowerCase();
        if (isCorrect) earned += q.points || 1;
      });
      const score = total > 0 ? Math.round((earned / total) * 100) : 0;

      // Save final results - only use columns that exist
      const { error } = await supabase
        .from("exam_attempts")
        .update({
          answers: answers,
          flagged: Array.from(flagged),
          score: score,
          completed_at: new Date().toISOString(),
          status: "completed",
        })
        .eq("id", attemptId);

      if (error) {
        console.error("Submit error:", error);
        alert("Failed to submit. Error: " + error.message);
        return;
      }

      // Store anti-cheat data in localStorage for results page
      localStorage.setItem(
        `exam_${attemptId}_violations`,
        JSON.stringify(violations),
      );
      localStorage.setItem(
        `exam_${attemptId}_tab_switches`,
        String(tabSwitchCount),
      );
      localStorage.setItem(
        `exam_${attemptId}_time_used`,
        String(examDuration * 60 - timeRemaining),
      );

      navigate(`/exam/${examId}/results/${attemptId}`);
    } catch (e) {
      console.error("Submit exception:", e);
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const getStatus = (id: string) => {
    if (currentQuestion?.id === id) return "current";
    if (flagged.has(id) && answers[id]) return "flagged-answered";
    if (flagged.has(id)) return "flagged";
    if (answers[id]) return "answered";
    return "";
  };

  const statusColor = (s: string) => {
    const colors: Record<string, string> = {
      current: "bg-indigo-600 text-white ring-2 ring-indigo-300",
      answered: "bg-green-500 text-white",
      flagged: "bg-orange-500 text-white",
      "flagged-answered": "bg-orange-500 text-white ring-2 ring-green-400",
    };
    return colors[s] || "bg-gray-100 text-gray-600 hover:bg-gray-200";
  };

  const fontSizeClasses = {
    normal: "text-base",
    large: "text-lg",
    xlarge: "text-xl",
  };

  // Loading state
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading exam...</p>
        </div>
      </div>
    );

  // No questions state
  if (!currentQuestion)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
          <p className="text-gray-700 mb-4">No questions found</p>
          <button
            onClick={() => navigate("/exams")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );

  const options = parseOptions(currentQuestion.options);
  const letters = ["A", "B", "C", "D", "E", "F"];

  return (
    <div
      className={`h-screen flex flex-col ${highContrast ? "bg-black" : "bg-gray-100"} ${fontSizeClasses[fontSize]} select-none`}
    >
      {/* Warning Banner */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-red-600 text-white py-3 px-4 text-center z-50 flex items-center justify-center gap-2 shadow-lg"
          >
            <AlertTriangle className="w-5 h-5" />
            {warningMessage}
            {tabSwitchCount > 0 && (
              <span className="ml-3 bg-red-700 px-2 py-0.5 rounded text-sm">
                Switches: {tabSwitchCount}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header
        className={`h-16 ${highContrast ? "bg-gray-900 border-gray-700" : "bg-white"} border-b shadow-sm flex items-center justify-between px-6 shrink-0`}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">📝</span>
          </div>
          <div>
            <h1
              className={`font-semibold ${highContrast ? "text-white" : "text-gray-800"} text-lg`}
            >
              EduAssess
            </h1>
            <p
              className={`text-xs ${highContrast ? "text-gray-400" : "text-gray-500"} truncate max-w-xs`}
            >
              {examTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Anti-cheat indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${highContrast ? "bg-gray-800" : "bg-gray-100"}`}
          >
            <Shield className="w-3.5 h-3.5 text-green-600" />
            <span className={highContrast ? "text-gray-300" : "text-gray-600"}>
              Protected
            </span>
            {tabSwitchCount > 0 && (
              <span className="text-red-500 font-bold">({tabSwitchCount})</span>
            )}
          </div>

          {/* Save status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${
              saveStatus === "saved"
                ? "bg-green-100 text-green-700"
                : saveStatus === "saving"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            {saveStatus === "saved"
              ? "Saved"
              : saveStatus === "saving"
                ? "Saving..."
                : "Error"}
          </div>

          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-semibold ${
              timeRemaining < 300
                ? "bg-red-100 text-red-600 animate-pulse"
                : "bg-indigo-50 text-indigo-700"
            }`}
          >
            <Clock className="w-5 h-5" />
            {formatTime(timeRemaining)}
          </div>

          {/* Accessibility */}
          <button
            onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
              showAccessibilityPanel
                ? "bg-indigo-600 text-white"
                : highContrast
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Accessibility className="w-5 h-5" />
          </button>

          {/* User avatar */}
          <div
            className={`w-9 h-9 ${highContrast ? "bg-gray-700" : "bg-indigo-100"} rounded-full flex items-center justify-center ${highContrast ? "text-white" : "text-indigo-700"} font-semibold`}
          >
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </header>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {showAccessibilityPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-16 right-6 ${highContrast ? "bg-gray-800 border-gray-700" : "bg-white"} rounded-xl shadow-xl border p-4 z-40 w-64`}
          >
            <h3
              className={`font-semibold ${highContrast ? "text-white" : "text-gray-800"} mb-3`}
            >
              Accessibility
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span
                  className={`text-sm ${highContrast ? "text-gray-300" : "text-gray-600"}`}
                >
                  Keyboard Nav
                </span>
                <button
                  onClick={() => setAccessibilityMode(!accessibilityMode)}
                  className={`w-11 h-6 rounded-full transition ${accessibilityMode ? "bg-indigo-600" : "bg-gray-300"}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transform transition ${accessibilityMode ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between">
                <span
                  className={`text-sm ${highContrast ? "text-gray-300" : "text-gray-600"}`}
                >
                  High Contrast
                </span>
                <button
                  onClick={() => setHighContrast(!highContrast)}
                  className={`w-11 h-6 rounded-full transition ${highContrast ? "bg-indigo-600" : "bg-gray-300"}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transform transition ${highContrast ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </button>
              </label>

              <div>
                <span
                  className={`text-sm ${highContrast ? "text-gray-300" : "text-gray-600"} block mb-2`}
                >
                  Font Size
                </span>
                <div className="flex gap-1">
                  {(["normal", "large", "xlarge"] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`flex-1 py-1.5 rounded text-sm font-medium ${fontSize === size ? "bg-indigo-600 text-white" : highContrast ? "bg-gray-700 text-gray-300" : "bg-gray-100"}`}
                    >
                      {size === "normal"
                        ? "A"
                        : size === "large"
                          ? "A+"
                          : "A++"}
                    </button>
                  ))}
                </div>
              </div>

              {accessibilityMode && (
                <div
                  className={`pt-2 border-t ${highContrast ? "border-gray-700 text-gray-400" : "text-gray-500"} text-xs`}
                >
                  <p>← → Navigate</p>
                  <p>1-4 Select answer</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <aside
          className={`w-48 ${highContrast ? "bg-gray-900 border-gray-700" : "bg-white"} border-r p-3 flex flex-col shrink-0`}
        >
          <div
            className={`text-sm font-medium ${highContrast ? "text-white" : "text-gray-700"} mb-1`}
          >
            Q {currentIndex + 1}/{totalQuestions}
          </div>
          <div className="flex gap-2 text-xs mb-3">
            <span className="text-green-600">✓{answeredCount}</span>
            <span className="text-orange-500">⚑{flagged.size}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-5 gap-1">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => goTo(i)}
                  className={`w-7 h-7 rounded text-xs font-semibold transition ${statusColor(getStatus(q.id))}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <div
            className={`mt-2 pt-2 border-t ${highContrast ? "border-gray-700 text-gray-400" : "text-gray-500"} text-xs space-y-0.5`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-green-500" />
              Done
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-orange-500" />
              Flag
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-600" />
              Now
            </div>
          </div>
        </aside>

        {/* Question Area */}
        <main className="flex-1 flex flex-col min-h-0 p-4">
          <div
            className={`flex-1 ${highContrast ? "bg-gray-900 border-gray-700" : "bg-white"} rounded-xl shadow-sm border overflow-y-auto`}
          >
            <div className="p-5 max-w-4xl mx-auto">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`${highContrast ? "bg-indigo-500 text-white" : "bg-indigo-100 text-indigo-700"} px-2.5 py-1 rounded-full font-bold text-sm`}
                  >
                    Q{currentIndex + 1}
                  </span>
                  <span
                    className={`text-sm ${highContrast ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {currentQuestion.question_type === "short_answer"
                      ? "📝 Type answer"
                      : "🔘 Choose one"}
                  </span>
                </div>
                <button
                  onClick={toggleFlag}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition ${
                    flagged.has(currentQuestion.id)
                      ? "bg-orange-100 text-orange-600"
                      : highContrast
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {flagged.has(currentQuestion.id) ? "Flagged" : "Flag"}
                </button>
              </div>

              {/* Question Content */}
              <div
                className={`prose prose-lg max-w-none mb-5 question-content ${highContrast ? "prose-invert" : ""}`}
                dangerouslySetInnerHTML={{
                  __html: currentQuestion.question_text,
                }}
              />

              {/* Answer Area */}
              {currentQuestion.question_type === "short_answer" ? (
                <div className="space-y-2">
                  <label
                    className={`block ${highContrast ? "text-gray-300" : "text-gray-700"} font-medium text-sm`}
                  >
                    Your Answer:
                  </label>
                  <input
                    type="text"
                    value={shortAnswer}
                    onChange={(e) => handleShortAnswer(e.target.value)}
                    placeholder="Type here..."
                    className={`w-full max-w-md p-3 border-2 rounded-lg outline-none ${highContrast ? "bg-gray-800 border-gray-600 text-white" : "border-gray-200 focus:border-indigo-500"}`}
                  />
                  {answers[currentQuestion.id] && (
                    <p className="text-green-600 text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Saved
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                  {options.map((opt, i) => {
                    const val = letters[i];
                    const sel = answers[currentQuestion.id] === val;
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswerSelect(val)}
                        className={`p-3 rounded-lg border-2 text-left transition flex items-start gap-2.5 ${
                          sel
                            ? highContrast
                              ? "border-indigo-400 bg-indigo-900/50"
                              : "border-indigo-500 bg-indigo-50"
                            : highContrast
                              ? "border-gray-700 bg-gray-800"
                              : "border-gray-200 hover:border-indigo-300"
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${sel ? "bg-indigo-600 text-white" : highContrast ? "bg-gray-700 text-gray-300" : "bg-gray-100"}`}
                        >
                          {val}
                        </span>
                        <span
                          className={`flex-1 pt-0.5 ${sel ? (highContrast ? "text-indigo-300" : "text-indigo-700") : highContrast ? "text-gray-300" : "text-gray-700"}`}
                          dangerouslySetInnerHTML={{ __html: opt }}
                        />
                        {sel && (
                          <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className={`flex items-center justify-between mt-3 ${highContrast ? "bg-gray-900 border-gray-700" : "bg-white"} rounded-lg shadow-sm border p-3 shrink-0`}
          >
            <button
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition ${
                currentIndex === 0
                  ? highContrast
                    ? "bg-gray-800 text-gray-600"
                    : "bg-gray-100 text-gray-400"
                  : highContrast
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <span
              className={`${highContrast ? "text-gray-400" : "text-gray-500"} text-sm`}
            >
              {answeredCount}/{totalQuestions}
            </span>
            {currentIndex === totalQuestions - 1 ? (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
                Submit
              </button>
            ) : (
              <button
                onClick={() => goTo(currentIndex + 1)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>
      </div>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSubmitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className={`${highContrast ? "bg-gray-900" : "bg-white"} rounded-xl p-5 max-w-xs w-full`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send className="w-6 h-6 text-green-600" />
                </div>
                <h3
                  className={`text-lg font-bold mb-2 ${highContrast ? "text-white" : ""}`}
                >
                  Submit?
                </h3>
                <p
                  className={`${highContrast ? "text-gray-400" : "text-gray-600"} text-sm mb-3`}
                >
                  {answeredCount}/{totalQuestions} answered
                  {answeredCount < totalQuestions && (
                    <span className="text-orange-500 block">
                      ⚠️ {totalQuestions - answeredCount} unanswered
                    </span>
                  )}
                </p>
                {tabSwitchCount > 0 && (
                  <p className="text-red-500 text-xs mb-3">
                    ⚠️ {tabSwitchCount} tab switches recorded
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className={`flex-1 py-2 rounded-lg font-medium ${highContrast ? "bg-gray-700 text-white" : "bg-gray-100"}`}
                  >
                    Review
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {submitting ? "..." : "Submit"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles */}
      <style>{`
        .question-content { font-size: ${fontSize === "xlarge" ? "20px" : fontSize === "large" ? "18px" : "16px"}; line-height: 1.6; }
        .question-content p { margin-bottom: 10px; }
        .question-content svg { max-width: 100%; height: auto; display: block; margin: 12px auto; }
        .question-content table { border-collapse: collapse; margin: 12px 0; }
        .question-content th, .question-content td { border: 1px solid ${highContrast ? "#374151" : "#d1d5db"}; padding: 6px 12px; }
        .question-content th { background: ${highContrast ? "#1f2937" : "#f3f4f6"}; }
        .prose-invert { color: #e5e7eb; }
        .prose-invert strong { color: #fff; }
      `}</style>
    </div>
  );
}
