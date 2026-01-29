// Dashboard service - fetches real user statistics from Supabase
import { supabase } from "./supabase";

// ============================================
// TYPES
// ============================================

export interface DashboardStats {
  totalExamsTaken: number;
  averageScore: number;
  totalTimeSpent: number; // in seconds
  improvementPercentage: number;
  completedExams: number;
  bestScore: number;
}

export interface RecentAttemptWithExam {
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
  exam: {
    id: string;
    title: string;
    exam_type: string;
    subject: string;
    year_level: number;
    duration_minutes: number;
    total_questions: number;
  };
}

export interface TopicPerformance {
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentAttempts: RecentAttemptWithExam[];
  strongTopics: string[];
  weakTopics: string[];
  isLoading: boolean;
  error: string | null;
}

// ============================================
// FETCH DASHBOARD STATS
// ============================================

export async function fetchDashboardStats(
  userId: string,
): Promise<DashboardStats> {
  try {
    // Fetch all completed attempts for the user
    const { data: attempts, error } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (error) {
      console.error("Error fetching attempts:", error);
      return getEmptyStats();
    }

    if (!attempts || attempts.length === 0) {
      return getEmptyStats();
    }

    // Filter completed attempts
    const completedAttempts = attempts.filter((a) => a.status === "completed");

    // Calculate total exams taken (all attempts)
    const totalExamsTaken = attempts.length;

    // Calculate completed exams
    const completedExams = completedAttempts.length;

    // Calculate average score (only from completed exams)
    const validScores = completedAttempts.filter(
      (a) => a.percentage !== null && a.percentage !== undefined,
    );
    const averageScore =
      validScores.length > 0
        ? Math.round(
            validScores.reduce((sum, a) => sum + (a.percentage || 0), 0) /
              validScores.length,
          )
        : 0;

    // Calculate best score
    const bestScore =
      validScores.length > 0
        ? Math.max(...validScores.map((a) => a.percentage || 0))
        : 0;

    // Calculate total time spent (from completed exams)
    const totalTimeSpent = completedAttempts.reduce(
      (sum, a) => sum + (a.time_spent_seconds || 0),
      0,
    );

    // Calculate improvement (compare last 5 vs first 5 exams)
    const improvementPercentage = calculateImprovement(completedAttempts);

    return {
      totalExamsTaken,
      completedExams,
      averageScore,
      bestScore,
      totalTimeSpent,
      improvementPercentage,
    };
  } catch (err) {
    console.error("Error in fetchDashboardStats:", err);
    return getEmptyStats();
  }
}

// ============================================
// FETCH RECENT ATTEMPTS
// ============================================

export async function fetchRecentAttempts(
  userId: string,
  limit: number = 5,
): Promise<RecentAttemptWithExam[]> {
  try {
    // Fetch recent completed attempts with exam details
    const { data: attempts, error } = await supabase
      .from("exam_attempts")
      .select(
        `
        *,
        exam:exams (
          id,
          title,
          exam_type,
          subject,
          year_level,
          duration_minutes,
          total_questions
        )
      `,
      )
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent attempts:", error);
      return [];
    }

    // Transform the data to match our type
    return (attempts || []).map((attempt) => ({
      ...attempt,
      exam: attempt.exam as RecentAttemptWithExam["exam"],
    }));
  } catch (err) {
    console.error("Error in fetchRecentAttempts:", err);
    return [];
  }
}

// ============================================
// FETCH TOPIC PERFORMANCE
// ============================================

export async function fetchTopicPerformance(
  userId: string,
): Promise<{ strongTopics: string[]; weakTopics: string[] }> {
  try {
    // Fetch user progress data grouped by subject
    const { data: progress, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching progress:", error);
      return { strongTopics: [], weakTopics: [] };
    }

    if (!progress || progress.length === 0) {
      // If no progress data, derive from exam attempts
      return deriveTopicsFromAttempts(userId);
    }

    // Calculate performance by subject
    const subjectPerformance = progress.map((p) => ({
      subject: p.subject,
      percentage:
        p.total_questions_answered > 0
          ? Math.round((p.correct_answers / p.total_questions_answered) * 100)
          : 0,
    }));

    // Sort by percentage
    subjectPerformance.sort((a, b) => b.percentage - a.percentage);

    // Strong topics: >= 70% correct
    const strongTopics = subjectPerformance
      .filter((p) => p.percentage >= 70)
      .map((p) => formatSubjectName(p.subject))
      .slice(0, 3);

    // Weak topics: < 60% correct
    const weakTopics = subjectPerformance
      .filter((p) => p.percentage < 60 && p.percentage > 0)
      .map((p) => formatSubjectName(p.subject))
      .slice(0, 3);

    return { strongTopics, weakTopics };
  } catch (err) {
    console.error("Error in fetchTopicPerformance:", err);
    return { strongTopics: [], weakTopics: [] };
  }
}

// ============================================
// FETCH PROFILE STATS (for ProfilePage)
// ============================================

export interface ProfileStats {
  examsTaken: number;
  averageScore: number;
  totalStudyTime: number; // in seconds
  bestScore: number;
  completedExams: number;
  subjectBreakdown: {
    subject: string;
    count: number;
    avgScore: number;
  }[];
}

export async function fetchProfileStats(userId: string): Promise<ProfileStats> {
  try {
    // Fetch all attempts for the user
    const { data: attempts, error } = await supabase
      .from("exam_attempts")
      .select(
        `
        *,
        exam:exams (
          subject
        )
      `,
      )
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching profile stats:", error);
      return getEmptyProfileStats();
    }

    if (!attempts || attempts.length === 0) {
      return getEmptyProfileStats();
    }

    const completedAttempts = attempts.filter((a) => a.status === "completed");

    // Calculate basic stats
    const examsTaken = attempts.length;
    const completedExams = completedAttempts.length;

    const validScores = completedAttempts.filter(
      (a) => a.percentage !== null && a.percentage !== undefined,
    );

    const averageScore =
      validScores.length > 0
        ? Math.round(
            validScores.reduce((sum, a) => sum + (a.percentage || 0), 0) /
              validScores.length,
          )
        : 0;

    const bestScore =
      validScores.length > 0
        ? Math.max(...validScores.map((a) => a.percentage || 0))
        : 0;

    const totalStudyTime = completedAttempts.reduce(
      (sum, a) => sum + (a.time_spent_seconds || 0),
      0,
    );

    // Calculate subject breakdown
    const subjectMap = new Map<
      string,
      { count: number; totalScore: number; validCount: number }
    >();

    completedAttempts.forEach((attempt) => {
      const subject = (attempt.exam as { subject: string })?.subject;
      if (subject) {
        const existing = subjectMap.get(subject) || {
          count: 0,
          totalScore: 0,
          validCount: 0,
        };
        existing.count++;
        if (attempt.percentage !== null) {
          existing.totalScore += attempt.percentage;
          existing.validCount++;
        }
        subjectMap.set(subject, existing);
      }
    });

    const subjectBreakdown = Array.from(subjectMap.entries())
      .map(([subject, data]) => ({
        subject: formatSubjectName(subject),
        count: data.count,
        avgScore:
          data.validCount > 0
            ? Math.round(data.totalScore / data.validCount)
            : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      examsTaken,
      completedExams,
      averageScore,
      bestScore,
      totalStudyTime,
      subjectBreakdown,
    };
  } catch (err) {
    console.error("Error in fetchProfileStats:", err);
    return getEmptyProfileStats();
  }
}

// ============================================
// FETCH ALL DASHBOARD DATA
// ============================================

export async function fetchDashboardData(
  userId: string,
): Promise<DashboardData> {
  try {
    // Fetch all data in parallel
    const [stats, recentAttempts, topics] = await Promise.all([
      fetchDashboardStats(userId),
      fetchRecentAttempts(userId, 5),
      fetchTopicPerformance(userId),
    ]);

    return {
      stats,
      recentAttempts,
      strongTopics: topics.strongTopics,
      weakTopics: topics.weakTopics,
      isLoading: false,
      error: null,
    };
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    return {
      stats: getEmptyStats(),
      recentAttempts: [],
      strongTopics: [],
      weakTopics: [],
      isLoading: false,
      error: "Failed to load dashboard data",
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getEmptyStats(): DashboardStats {
  return {
    totalExamsTaken: 0,
    completedExams: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
    improvementPercentage: 0,
  };
}

function getEmptyProfileStats(): ProfileStats {
  return {
    examsTaken: 0,
    completedExams: 0,
    averageScore: 0,
    bestScore: 0,
    totalStudyTime: 0,
    subjectBreakdown: [],
  };
}

interface AttemptWithTimestamp {
  completed_at?: string | null;
  started_at: string;
  percentage?: number | null;
}

function calculateImprovement(attempts: AttemptWithTimestamp[]): number {
  if (attempts.length < 2) return 0;

  // Sort by date (oldest first)
  const sorted = [...attempts].sort(
    (a, b) =>
      new Date(a.completed_at || a.started_at).getTime() -
      new Date(b.completed_at || b.started_at).getTime(),
  );

  // Get first 5 and last 5 attempts
  const firstFive = sorted.slice(0, Math.min(5, Math.floor(sorted.length / 2)));
  const lastFive = sorted.slice(-Math.min(5, Math.ceil(sorted.length / 2)));

  // Calculate averages
  const firstAvg =
    firstFive.reduce((sum, a) => sum + (a.percentage || 0), 0) /
    firstFive.length;
  const lastAvg =
    lastFive.reduce((sum, a) => sum + (a.percentage || 0), 0) / lastFive.length;

  // Calculate improvement percentage
  const improvement = Math.round(lastAvg - firstAvg);
  return improvement;
}

async function deriveTopicsFromAttempts(
  userId: string,
): Promise<{ strongTopics: string[]; weakTopics: string[] }> {
  try {
    // Fetch completed attempts with exam details
    const { data: attempts, error } = await supabase
      .from("exam_attempts")
      .select(
        `
        percentage,
        exam:exams(subject)
      `,
      )
      .eq("user_id", userId)
      .eq("status", "completed");

    if (error || !attempts || attempts.length === 0) {
      return { strongTopics: [], weakTopics: [] };
    }

    // Group by subject
    const subjectScores: Record<string, number[]> = {};

    attempts.forEach((attempt) => {
      const subject = (attempt.exam as { subject?: string })?.subject;
      if (subject && attempt.percentage !== null) {
        if (!subjectScores[subject]) {
          subjectScores[subject] = [];
        }
        subjectScores[subject].push(attempt.percentage);
      }
    });

    // Calculate average per subject
    const subjectAverages = Object.entries(subjectScores).map(
      ([subject, scores]) => ({
        subject,
        average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      }),
    );

    // Sort by average
    subjectAverages.sort((a, b) => b.average - a.average);

    const strongTopics = subjectAverages
      .filter((s) => s.average >= 70)
      .map((s) => formatSubjectName(s.subject))
      .slice(0, 3);

    const weakTopics = subjectAverages
      .filter((s) => s.average < 60 && s.average > 0)
      .map((s) => formatSubjectName(s.subject))
      .slice(0, 3);

    return { strongTopics, weakTopics };
  } catch (err) {
    console.error("Error deriving topics:", err);
    return { strongTopics: [], weakTopics: [] };
  }
}

function formatSubjectName(subject: string): string {
  // Convert database subject names to display names
  const subjectMap: Record<string, string> = {
    maths: "Mathematics",
    mathematics: "Mathematics",
    science: "Science",
    english: "English",
    reading: "Reading",
    writing: "Writing",
    "digital-technologies": "Digital Technologies",
    "digital technologies": "Digital Technologies",
    numeracy: "Numeracy",
    "language conventions": "Language Conventions",
    "language-conventions": "Language Conventions",
  };

  return (
    subjectMap[subject.toLowerCase()] ||
    subject.charAt(0).toUpperCase() + subject.slice(1)
  );
}

// ============================================
// UPDATE USER PROGRESS AFTER EXAM
// ============================================

export async function updateUserProgress(
  userId: string,
  examId: string,
  score: number,
  totalQuestions: number,
  timeSpent: number,
): Promise<void> {
  try {
    // First, get the exam to know the subject and type
    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("subject, exam_type")
      .eq("id", examId)
      .single();

    if (examError || !exam) {
      console.error("Error fetching exam for progress update:", examError);
      return;
    }

    // Check if user progress exists for this subject/type combo
    const { data: existingProgress, error: progressError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("subject", exam.subject)
      .eq("exam_type", exam.exam_type)
      .single();

    if (progressError && progressError.code !== "PGRST116") {
      // PGRST116 = no rows found, which is OK
      console.error("Error checking existing progress:", progressError);
      return;
    }

    const percentage = Math.round((score / totalQuestions) * 100);

    if (existingProgress) {
      // Update existing progress
      const newTotalAttempts = existingProgress.total_attempts + 1;
      const newTotalQuestions =
        existingProgress.total_questions_answered + totalQuestions;
      const newCorrectAnswers = existingProgress.correct_answers + score;
      const newAverageScore = Math.round(
        (newCorrectAnswers / newTotalQuestions) * 100,
      );
      const newBestScore = Math.max(
        existingProgress.best_score || 0,
        percentage,
      );
      const newTotalTime =
        existingProgress.total_time_spent_seconds + timeSpent;

      await supabase
        .from("user_progress")
        .update({
          total_attempts: newTotalAttempts,
          total_questions_answered: newTotalQuestions,
          correct_answers: newCorrectAnswers,
          average_score: newAverageScore,
          best_score: newBestScore,
          total_time_spent_seconds: newTotalTime,
          last_activity_at: new Date().toISOString(),
        })
        .eq("id", existingProgress.id);
    } else {
      // Create new progress entry
      await supabase.from("user_progress").insert({
        user_id: userId,
        subject: exam.subject,
        exam_type: exam.exam_type,
        total_attempts: 1,
        total_questions_answered: totalQuestions,
        correct_answers: score,
        average_score: percentage,
        best_score: percentage,
        total_time_spent_seconds: timeSpent,
        last_activity_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("Error updating user progress:", err);
  }
}
