export const APP_NAME = "EduAssess Platform";

export const YEAR_LEVELS = [2, 3, 4, 5, 6, 7, 8, 9] as const;

export const EXAM_TYPES = {
  NAPLAN: "naplan",
  ICAS: "icas",
  ICAS_ALLSTARS: "icas-allstars",
} as const;

export const SUBJECTS = {
  MATHS: "maths",
  SCIENCE: "science",
  DIGITAL_TECH: "digital-technologies",
} as const;

export const SUBJECT_LABELS = {
  [SUBJECTS.MATHS]: "Mathematics",
  [SUBJECTS.SCIENCE]: "Science",
  [SUBJECTS.DIGITAL_TECH]: "Digital Technologies",
} as const;

export const EXAM_TYPE_LABELS = {
  [EXAM_TYPES.NAPLAN]: "NAPLAN",
  [EXAM_TYPES.ICAS]: "ICAS",
  [EXAM_TYPES.ICAS_ALLSTARS]: "ICAS All-Stars",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  EXAMS: "/exams",
  EXAM_DETAILS: "/exams/:id",
  TAKE_EXAM: "/exam/:id/take",
  EXAM_RESULTS: "/exam/:id/results",
  PROFILE: "/profile",
  PRICING: "/pricing",
  ABOUT: "/about",
  CONTACT: "/contact",
  FAQ: "/faq",
} as const;

export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: "Free",
    price: 0,
    features: [
      "Access to 1 sample exam per subject",
      "Basic progress tracking",
      "Limited exam history",
    ],
  },
  PREMIUM: {
    name: "Premium",
    price: 29.99,
    features: [
      "Unlimited access to all exams",
      "Detailed performance analytics",
      "Topic-wise breakdown",
      "Unlimited exam retakes",
      "Priority support",
      "Downloadable reports",
    ],
  },
} as const;

export const TIMER_WARNING_THRESHOLD = 120;
export const TIMER_CRITICAL_THRESHOLD = 60;
export const SESSION_TIMEOUT = 30 * 60 * 1000;
export const TOAST_DURATION = 3000;
