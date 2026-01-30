// src/data/constants/index.ts
// Application constants with PRICING route added
// ============================================

// ============================================
// ROUTES
// ============================================

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  EXAMS: "/exams",
  EXAM_START: "/exam/:examId/start",
  EXAM_TAKE: "/exam/:examId/take/:attemptId",
  EXAM_RESULTS: "/exam/:examId/results/:attemptId",
  RESULTS: "/results",
  PROFILE: "/profile",
  PRICING: "/pricing",
  SUBSCRIPTION_SUCCESS: "/subscription/success",
} as const;

// ============================================
// EXAM TYPES
// ============================================

export const EXAM_TYPES = [
  { id: "NAPLAN", name: "NAPLAN", description: "National Assessment Program" },
  {
    id: "ICAS",
    name: "ICAS",
    description: "International Competitions and Assessments",
  },
] as const;

// ============================================
// YEAR LEVELS
// ============================================

export const YEAR_LEVELS = [
  { value: 2, label: "Year 2" },
  { value: 3, label: "Year 3" },
  { value: 4, label: "Year 4" },
  { value: 5, label: "Year 5" },
  { value: 6, label: "Year 6" },
  { value: 7, label: "Year 7" },
  { value: 8, label: "Year 8" },
  { value: 9, label: "Year 9" },
] as const;

// ============================================
// SUBJECTS
// ============================================

export const SUBJECTS = [
  { id: "mathematics", name: "Mathematics", icon: "🔢", color: "blue" },
  { id: "english", name: "English", icon: "📚", color: "green" },
  { id: "science", name: "Science", icon: "🔬", color: "purple" },
  { id: "reading", name: "Reading", icon: "📖", color: "orange" },
  { id: "writing", name: "Writing", icon: "✏️", color: "pink" },
  { id: "numeracy", name: "Numeracy", icon: "🧮", color: "cyan" },
  {
    id: "digital-technologies",
    name: "Digital Technologies",
    icon: "💻",
    color: "indigo",
  },
] as const;

// ============================================
// DIFFICULTY LEVELS
// ============================================

export const DIFFICULTY_LEVELS = [
  { id: "easy", name: "Easy", color: "green" },
  { id: "medium", name: "Medium", color: "yellow" },
  { id: "hard", name: "Hard", color: "red" },
] as const;

// ============================================
// SUBSCRIPTION PLANS
// ============================================

export const FREE_EXAM_LIMIT = 5;

export const PLAN_FEATURES = {
  free: [
    "5 free practice exams",
    "Basic progress tracking",
    "Limited question bank",
    "Community support",
  ],
  premium: [
    "Unlimited practice exams",
    "All NAPLAN & ICAS content",
    "Detailed analytics & insights",
    "Personalized study plans",
    "Parent progress reports",
    "Priority email support",
    "No ads",
  ],
} as const;
