// Route constants
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  EXAMS: "/exams",
  EXAM_START: "/exam/:examId/start", // View exam info
  EXAM_TAKE: "/exam/:examId/take/:attemptId", // Take the exam ← ADD THIS
  EXAM_RESULTS: "/exam/:examId/results/:attemptId",
  RESULTS: "/results",
  PROFILE: "/profile",
} as const;

// Exam types
export const EXAM_TYPES = [
  { value: "all", label: "All Types", emoji: "📚" },
  { value: "NAPLAN", label: "NAPLAN", emoji: "📘" },
  { value: "ICAS", label: "ICAS", emoji: "📗" },
] as const;

// Year levels
export const YEAR_LEVELS = [
  { value: "all", label: "All Years", emoji: "🎓" },
  { value: "2", label: "Year 2", emoji: "2️⃣" },
  { value: "3", label: "Year 3", emoji: "3️⃣" },
  { value: "4", label: "Year 4", emoji: "4️⃣" },
  { value: "5", label: "Year 5", emoji: "5️⃣" },
  { value: "6", label: "Year 6", emoji: "6️⃣" },
  { value: "7", label: "Year 7", emoji: "7️⃣" },
  { value: "8", label: "Year 8", emoji: "8️⃣" },
  { value: "9", label: "Year 9", emoji: "9️⃣" },
] as const;

// Subjects
export const SUBJECTS = [
  { value: "all", label: "All Subjects", emoji: "📖" },
  { value: "Mathematics", label: "Mathematics", emoji: "🔢" },
  { value: "Reading", label: "Reading", emoji: "📖" },
  { value: "Writing", label: "Writing", emoji: "✏️" },
  { value: "Language Conventions", label: "Language", emoji: "📝" },
  { value: "Numeracy", label: "Numeracy", emoji: "🧮" },
  { value: "Science", label: "Science", emoji: "🔬" },
  { value: "Digital Technologies", label: "Digital Tech", emoji: "💻" },
] as const;

// Difficulty levels
export const DIFFICULTY_LEVELS = [
  {
    value: "easy",
    label: "Easy",
    emoji: "🟢",
    color: "text-green-600 bg-green-100",
  },
  {
    value: "medium",
    label: "Medium",
    emoji: "🟡",
    color: "text-yellow-600 bg-yellow-100",
  },
  {
    value: "hard",
    label: "Hard",
    emoji: "🔴",
    color: "text-red-600 bg-red-100",
  },
] as const;
