import type { Exam, ExamAttempt } from '@/types';

// Mock Users for testing
export const MOCK_USERS = [
  {
    id: 'user-1',
    email: 'student@test.com',
    firstName: 'Alex',
    lastName: 'Johnson',
    yearLevel: 5,
    schoolName: 'Melbourne Primary School',
    createdAt: '2024-01-15T00:00:00Z',
    subscriptionStatus: 'premium' as const,
  },
  {
    id: 'user-2',
    email: 'parent@test.com',
    firstName: 'Sarah',
    lastName: 'Smith',
    yearLevel: 4,
    schoolName: undefined,
    createdAt: '2024-02-01T00:00:00Z',
    subscriptionStatus: 'free' as const,
  },
];

// Mock Exams
export const MOCK_EXAMS: Exam[] = [
  {
    id: 'exam-1',
    title: 'Year 4 Mathematics - Sample Test',
    type: 'naplan',
    subject: 'maths',
    yearLevel: 4,
    duration: 30,
    totalQuestions: 20,
    isFree: true,
    description: 'Free sample NAPLAN mathematics test for Year 4 students',
    topics: ['Number & Algebra', 'Measurement', 'Statistics'],
  },
  {
    id: 'exam-2',
    title: 'Year 4 Mathematics - Practice Test 1',
    type: 'naplan',
    subject: 'maths',
    yearLevel: 4,
    duration: 45,
    totalQuestions: 30,
    isFree: false,
    description: 'Comprehensive NAPLAN mathematics practice test',
    topics: ['Number & Algebra', 'Measurement', 'Statistics', 'Geometry'],
  },
  {
    id: 'exam-3',
    title: 'Year 5 Science - Sample Test',
    type: 'icas',
    subject: 'science',
    yearLevel: 5,
    duration: 40,
    totalQuestions: 25,
    isFree: true,
    description: 'Free sample ICAS science test for Year 5 students',
    topics: ['Life Science', 'Physical Science', 'Earth Science'],
  },
  {
    id: 'exam-4',
    title: 'Year 5 Science - Practice Test 1',
    type: 'icas',
    subject: 'science',
    yearLevel: 5,
    duration: 50,
    totalQuestions: 35,
    isFree: false,
    description: 'Comprehensive ICAS science practice test',
    topics: ['Life Science', 'Physical Science', 'Earth Science', 'Technology'],
  },
  {
    id: 'exam-5',
    title: 'Year 6 Digital Technologies - Sample',
    type: 'icas',
    subject: 'digital-technologies',
    yearLevel: 6,
    duration: 35,
    totalQuestions: 20,
    isFree: true,
    description: 'Free sample Digital Technologies test',
    topics: ['Algorithms', 'Data', 'Digital Systems'],
  },
];

// Mock Recent Exam Attempts
export const MOCK_RECENT_ATTEMPTS: ExamAttempt[] = [
  {
    id: 'attempt-1',
    userId: 'user-1',
    examId: 'exam-1',
    startTime: '2024-01-20T10:00:00Z',
    endTime: '2024-01-20T10:28:00Z',
    status: 'completed',
    answers: [],
    score: 16,
    percentage: 80,
    timeSpent: 1680, // 28 minutes in seconds
  },
  {
    id: 'attempt-2',
    userId: 'user-1',
    examId: 'exam-3',
    startTime: '2024-01-18T14:00:00Z',
    endTime: '2024-01-18T14:35:00Z',
    status: 'completed',
    answers: [],
    score: 20,
    percentage: 80,
    timeSpent: 2100, // 35 minutes
  },
  {
    id: 'attempt-3',
    userId: 'user-1',
    examId: 'exam-2',
    startTime: '2024-01-15T09:00:00Z',
    endTime: '2024-01-15T09:42:00Z',
    status: 'completed',
    answers: [],
    score: 24,
    percentage: 80,
    timeSpent: 2520, // 42 minutes
  },
];

// Mock Dashboard Stats
export const MOCK_DASHBOARD_STATS = {
  totalExamsTaken: 12,
  averageScore: 78,
  totalTimeSpent: 21600, // 6 hours in seconds
  recentExams: MOCK_RECENT_ATTEMPTS,
  strongTopics: ['Number & Algebra', 'Life Science', 'Algorithms'],
  weakTopics: ['Geometry', 'Statistics', 'Earth Science'],
};

// Default test credentials
export const TEST_CREDENTIALS = {
  email: 'student@test.com',
  password: 'Test123!',
};