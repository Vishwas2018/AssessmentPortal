import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  ChevronRight,
  Search,
  Filter,
  Award,
  Star,
  Loader2,
  FileText,
  BarChart3,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store';

interface ExamAttempt {
  id: string;
  exam_id: string;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  total_points: number | null;
  percentage: number | null;
  time_spent_seconds: number | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  exam?: {
    id: string;
    title: string;
    exam_type: string;
    year_level: number;
    subject: string;
    duration_minutes: number;
  };
}

// Helper to format time
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

// Helper to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Get grade based on percentage
function getGrade(percentage: number): { grade: string; color: string; emoji: string } {
  if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-600 bg-emerald-100', emoji: '🌟' };
  if (percentage >= 80) return { grade: 'A', color: 'text-green-600 bg-green-100', emoji: '⭐' };
  if (percentage >= 70) return { grade: 'B', color: 'text-blue-600 bg-blue-100', emoji: '👍' };
  if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600 bg-yellow-100', emoji: '👌' };
  if (percentage >= 50) return { grade: 'D', color: 'text-orange-600 bg-orange-100', emoji: '💪' };
  return { grade: 'F', color: 'text-red-600 bg-red-100', emoji: '📚' };
}

export default function ResultsPage() {
  const { user } = useAuthStore();
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalAttempts: 0,
    completedExams: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
  });

  useEffect(() => {
    async function fetchAttempts() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('exam_attempts')
          .select(`
            *,
            exam:exams (
              id,
              title,
              exam_type,
              year_level,
              subject,
              duration_minutes
            )
          `)
          .eq('user_id', user.id)
          .order('started_at', { ascending: false });

        if (error) {
          console.error('Error fetching attempts:', error);
          return;
        }

        setAttempts(data || []);

        // Calculate stats
        const completed = data?.filter((a) => a.status === 'completed') || [];
        const scores = completed.map((a) => a.percentage || 0);
        const totalTime = completed.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0);

        setStats({
          totalAttempts: data?.length || 0,
          completedExams: completed.length,
          averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
          bestScore: scores.length > 0 ? Math.max(...scores) : 0,
          totalTimeSpent: totalTime,
        });
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAttempts();
  }, [user]);

  // Filter attempts
  const filteredAttempts = attempts.filter((attempt) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'completed' && attempt.status === 'completed') ||
      (filter === 'in_progress' && attempt.status === 'in_progress');

    const matchesSearch =
      !searchQuery ||
      attempt.exam?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attempt.exam?.subject.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading your results...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-gray-800 flex items-center gap-3">
            <span className="text-4xl">📊</span>
            My Results
          </h1>
          <p className="text-gray-600 mt-2">Track your progress and celebrate your achievements!</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-5 border-2 border-indigo-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-gray-500 font-medium text-sm">Total Exams</span>
            </div>
            <p className="text-3xl font-black text-gray-800">{stats.totalAttempts}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5 border-2 border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-500 font-medium text-sm">Completed</span>
            </div>
            <p className="text-3xl font-black text-gray-800">{stats.completedExams}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5 border-2 border-purple-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-gray-500 font-medium text-sm">Average Score</span>
            </div>
            <p className="text-3xl font-black text-gray-800">{stats.averageScore}%</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5 border-2 border-yellow-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-gray-500 font-medium text-sm">Best Score</span>
            </div>
            <p className="text-3xl font-black text-gray-800">{stats.bestScore}%</p>
          </div>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex flex-col sm:flex-row gap-4"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none font-medium"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All', emoji: '📋' },
              { value: 'completed', label: 'Completed', emoji: '✅' },
              { value: 'in_progress', label: 'In Progress', emoji: '⏳' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as typeof filter)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  filter === f.value
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{f.emoji}</span>
                <span className="hidden sm:inline">{f.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredAttempts.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No results yet!</h3>
              <p className="text-gray-600 mb-6">Take some exams to see your results here.</p>
              <Link
                to="/exams"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors"
              >
                Browse Exams
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            filteredAttempts.map((attempt, index) => {
              const gradeInfo = attempt.percentage ? getGrade(attempt.percentage) : null;

              return (
                <motion.div
                  key={attempt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Exam Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">
                              {attempt.exam?.exam_type === 'NAPLAN' ? '📘' : '📗'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 text-lg truncate">
                              {attempt.exam?.title || 'Unknown Exam'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(attempt.started_at)}
                              </span>
                              {attempt.time_spent_seconds && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatDuration(attempt.time_spent_seconds)}
                                </span>
                              )}
                              <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">
                                Year {attempt.exam?.year_level}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Score & Actions */}
                      <div className="flex items-center gap-4">
                        {attempt.status === 'completed' && gradeInfo ? (
                          <>
                            {/* Score Display */}
                            <div className="text-center">
                              <div className="flex items-center gap-2">
                                <span className={`text-3xl font-black ${gradeInfo.color.split(' ')[0]}`}>
                                  {attempt.percentage}%
                                </span>
                                <span className="text-2xl">{gradeInfo.emoji}</span>
                              </div>
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${gradeInfo.color}`}>
                                Grade {gradeInfo.grade}
                              </span>
                            </div>

                            {/* View Details Button */}
                            <Link
                              to={`/exam/${attempt.exam_id}/results/${attempt.id}`}
                              className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-200 transition-colors"
                            >
                              View
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </>
                        ) : (
                          <>
                            {/* In Progress Badge */}
                            <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-semibold flex items-center gap-2">
                              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                              In Progress
                            </span>

                            {/* Continue Button */}
                            <Link
                              to={`/exam/${attempt.exam_id}/take/${attempt.id}`}
                              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors"
                            >
                              Continue
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar for Completed */}
                    {attempt.status === 'completed' && attempt.percentage !== null && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                          <span>Score: {attempt.score}/{attempt.total_points} points</span>
                          <span>{attempt.percentage}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${attempt.percentage}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`h-full rounded-full ${
                              attempt.percentage >= 70
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                                : attempt.percentage >= 50
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                : 'bg-gradient-to-r from-red-400 to-rose-500'
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Motivational Footer */}
        {stats.completedExams > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold shadow-lg">
              <Award className="w-5 h-5" />
              You've completed {stats.completedExams} exam{stats.completedExams > 1 ? 's' : ''}! Keep up the great work! 🎉
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}