// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  yearLevel: number;
  schoolName?: string;
  createdAt: string;
  subscriptionStatus: SubscriptionStatus;
}

export type SubscriptionStatus = "free" | "premium" | "trial";

// Exam Types
export type ExamType = "naplan" | "icas" | "icas-allstars";
export type Subject = "maths" | "science" | "digital-technologies";
export type QuestionType = "mcq" | "true-false" | "short-answer";

export interface Exam {
  id: string;
  title: string;
  type: ExamType;
  subject: Subject;
  yearLevel: number;
  duration: number; // in minutes
  totalQuestions: number;
  isFree: boolean;
  description?: string;
  topics: string[];
}

export interface Question {
  id: string;
  examId: string;
  type: QuestionType;
  text: string;
  topic: string;
  options?: string[]; // For MCQ
  correctAnswer: string | number;
  explanation: string;
  marks: number;
}

// Exam Attempt Types
export interface ExamAttempt {
  id: string;
  userId: string;
  examId: string;
  startTime: string;
  endTime?: string;
  status: "in-progress" | "completed" | "abandoned";
  answers: UserAnswer[];
  score?: number;
  percentage?: number;
  timeSpent?: number; // in seconds
}

export interface UserAnswer {
  questionId: string;
  answer: string | number;
  timeSpent: number; // in seconds
  flaggedForReview: boolean;
  isCorrect?: boolean;
}

// Results Types
export interface ExamResult {
  attemptId: string;
  exam: Exam;
  score: number;
  percentage: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  timeSpent: number;
  attemptDate: string;
  topicBreakdown: TopicPerformance[];
  answers: QuestionReview[];
}

export interface TopicPerformance {
  topic: string;
  total: number;
  correct: number;
  percentage: number;
  avgTimeSpent: number;
}

export interface QuestionReview {
  question: Question;
  userAnswer: string | number;
  isCorrect: boolean;
  timeSpent: number;
  flaggedForReview: boolean;
}

// Dashboard Types
export interface DashboardStats {
  totalExamsTaken: number;
  averageScore: number;
  totalTimeSpent: number;
  recentExams: ExamAttempt[];
  strongTopics: string[];
  weakTopics: string[];
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
  yearLevel: number;
  schoolName?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
