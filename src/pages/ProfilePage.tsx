import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  School,
  Calendar,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
  Trophy,
  Target,
  Clock,
  Edit3,
  X,
  Star,
  BookOpen,
} from "lucide-react";
import { useAuthStore } from "@/store";
import { supabase } from "@/lib/supabase";
import {
  profileUpdateSchema,
  type ProfileUpdateFormData,
} from "@/lib/validations";
import { fetchProfileStats, type ProfileStats } from "@/lib/dashboard";

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      fullName: profile?.full_name || "",
      displayName: profile?.display_name || "",
      yearLevel: profile?.year_level || undefined,
      schoolName: profile?.school_name || "",
      parentEmail: profile?.parent_email || "",
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.full_name || "",
        displayName: profile.display_name || "",
        yearLevel: profile.year_level || undefined,
        schoolName: profile.school_name || "",
        parentEmail: profile.parent_email || "",
      });
    }
  }, [profile, reset]);

  // Fetch real stats from Supabase
  useEffect(() => {
    async function loadStats() {
      if (!user?.id) {
        setIsLoadingStats(false);
        return;
      }

      try {
        const stats = await fetchProfileStats(user.id);
        setProfileStats(stats);
      } catch (err) {
        console.error("Error loading profile stats:", err);
      } finally {
        setIsLoadingStats(false);
      }
    }

    loadStats();
  }, [user?.id]);

  const onSubmit = async (data: ProfileUpdateFormData) => {
    if (!user) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          full_name: data.fullName,
          display_name: data.displayName,
          year_level: data.yearLevel,
          school_name: data.schoolName,
          parent_email: data.parentEmail || null,
        } as never)
        .eq("id", user.id);

      if (error) {
        setErrorMessage("Failed to update profile. Please try again.");
        console.error("Profile update error:", error);
      } else {
        setSuccessMessage("Profile updated successfully! 🎉");
        await refreshProfile();
        setIsEditing(false);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred.");
      console.error("Profile update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset({
      fullName: profile?.full_name || "",
      displayName: profile?.display_name || "",
      yearLevel: profile?.year_level || undefined,
      schoolName: profile?.school_name || "",
      parentEmail: profile?.parent_email || "",
    });
    setIsEditing(false);
    setErrorMessage(null);
  };

  // Get display name and initials
  const displayName =
    profile?.full_name ||
    profile?.display_name ||
    user?.email?.split("@")[0] ||
    "Student";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Format time for display
  const formatStudyTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Stats to display - using real data or defaults
  const stats = [
    {
      label: "Exams Taken",
      value: isLoadingStats ? "..." : String(profileStats?.examsTaken || 0),
      icon: Target,
      color: "from-blue-400 to-cyan-400",
    },
    {
      label: "Avg Score",
      value: isLoadingStats
        ? "..."
        : profileStats?.averageScore
          ? `${profileStats.averageScore}%`
          : "-",
      icon: Trophy,
      color: "from-yellow-400 to-orange-400",
    },
    {
      label: "Study Time",
      value: isLoadingStats
        ? "..."
        : profileStats?.totalStudyTime
          ? formatStudyTime(profileStats.totalStudyTime)
          : "-",
      icon: Clock,
      color: "from-purple-400 to-pink-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
      <div className="container-custom">
        {/* Page Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-gray-800 mb-2">
            My Profile 👤
          </h1>
          <p className="text-gray-600 font-semibold">
            View and manage your account information
          </p>
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6 flex items-center space-x-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-green-700 font-medium">{successMessage}</p>
          </motion.div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{errorMessage}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center border-4 border-gray-100">
              {/* Avatar */}
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-4xl font-black shadow-lg">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:bg-gray-50 transition-colors">
                  <Camera className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Name */}
              <h2 className="text-2xl font-black text-gray-800 mb-1">
                {displayName}
              </h2>

              {/* Year Level Badge */}
              {profile?.year_level && (
                <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full font-bold text-sm mb-4">
                  Year {profile.year_level}
                </span>
              )}

              {/* Email */}
              <p className="text-gray-500 font-medium mb-6">{user?.email}</p>

              {/* Member Since */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">Member since</p>
                <p className="font-bold text-gray-700">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-AU", {
                        month: "long",
                        year: "numeric",
                      })
                    : "Recently"}
                </p>
              </div>
            </div>

            {/* Stats Cards - Now with Real Data */}
            <div className="mt-6 space-y-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-4 flex items-center space-x-4 border-2 border-gray-100"
                >
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-800">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500 font-medium">
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Best Score Card */}
              {profileStats && profileStats.bestScore > 0 && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg p-4 flex items-center space-x-4"
                >
                  <div className="p-3 rounded-xl bg-white/20">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">
                      {profileStats.bestScore}%
                    </p>
                    <p className="text-sm text-white/80 font-medium">
                      Best Score 🏆
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Subject Breakdown */}
            {profileStats &&
              profileStats.subjectBreakdown &&
              profileStats.subjectBreakdown.length > 0 && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100"
                >
                  <h3 className="font-black text-gray-800 mb-4 flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    <span>Subjects Practiced</span>
                  </h3>
                  <div className="space-y-3">
                    {profileStats.subjectBreakdown
                      .slice(0, 5)
                      .map((subject) => (
                        <div
                          key={subject.subject}
                          className="flex items-center justify-between"
                        >
                          <span className="font-medium text-gray-700">
                            {subject.subject}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {subject.count} exam
                              {subject.count !== 1 ? "s" : ""}
                            </span>
                            {subject.avgScore > 0 && (
                              <span
                                className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                                  subject.avgScore >= 70
                                    ? "bg-green-100 text-green-700"
                                    : subject.avgScore >= 50
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                }`}
                              >
                                {subject.avgScore}%
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}
          </motion.div>

          {/* Right Column - Profile Form */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-gray-100">
              {/* Form Header */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-800">
                  {isEditing ? "Edit Profile ✏️" : "Profile Details 📋"}
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary-100 text-primary-700 font-bold hover:bg-primary-200 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    <span>Full Name</span>
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        {...register("fullName")}
                        type="text"
                        placeholder="Enter your full name"
                        className={`w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.fullName
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 focus:border-primary-500"
                        }`}
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.fullName.message}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-xl font-semibold text-gray-800">
                      {profile?.full_name || "Not set"}
                    </p>
                  )}
                </div>

                {/* Display Name */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    <span>Display Name (Nickname)</span>
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        {...register("displayName")}
                        type="text"
                        placeholder="What should we call you?"
                        className={`w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.displayName
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 focus:border-primary-500"
                        }`}
                      />
                      {errors.displayName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.displayName.message}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-xl font-semibold text-gray-800">
                      {profile?.display_name || "Not set"}
                    </p>
                  )}
                </div>

                {/* Email (Read Only) */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                    <Mail className="w-4 h-4" />
                    <span>Email Address</span>
                  </label>
                  <p className="px-4 py-3 bg-gray-100 rounded-xl font-semibold text-gray-600">
                    {user?.email}
                    <span className="ml-2 text-xs text-gray-400">
                      (cannot be changed)
                    </span>
                  </p>
                </div>

                {/* Year Level */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>Year Level</span>
                  </label>
                  {isEditing ? (
                    <select
                      {...register("yearLevel", { valueAsNumber: true })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select your year</option>
                      {[2, 3, 4, 5, 6, 7, 8, 9].map((year) => (
                        <option key={year} value={year}>
                          Year {year}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-xl font-semibold text-gray-800">
                      {profile?.year_level
                        ? `Year ${profile.year_level}`
                        : "Not set"}
                    </p>
                  )}
                </div>

                {/* School Name */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                    <School className="w-4 h-4" />
                    <span>School Name</span>
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        {...register("schoolName")}
                        type="text"
                        placeholder="Enter your school name"
                        className={`w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.schoolName
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 focus:border-primary-500"
                        }`}
                      />
                      {errors.schoolName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.schoolName.message}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-xl font-semibold text-gray-800">
                      {profile?.school_name || "Not set"}
                    </p>
                  )}
                </div>

                {/* Parent Email */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
                    <Mail className="w-4 h-4" />
                    <span>Parent/Guardian Email (Optional)</span>
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        {...register("parentEmail")}
                        type="email"
                        placeholder="parent@email.com"
                        className={`w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.parentEmail
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 focus:border-primary-500"
                        }`}
                      />
                      {errors.parentEmail && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.parentEmail.message}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="px-4 py-3 bg-gray-50 rounded-xl font-semibold text-gray-800">
                      {profile?.parent_email || "Not set"}
                    </p>
                  )}
                </div>

                {/* Save Button */}
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-4"
                  >
                    <button
                      type="submit"
                      disabled={isLoading || !isDirty}
                      className="w-full py-4 rounded-xl font-black text-lg bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 bg-white rounded-3xl shadow-xl p-8 border-4 border-red-100"
            >
              <h3 className="text-xl font-black text-red-600 mb-4">
                Danger Zone ⚠️
              </h3>
              <p className="text-gray-600 mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <button
                className="px-6 py-3 rounded-xl font-bold border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                onClick={() =>
                  alert("Account deletion would be implemented here")
                }
              >
                Delete Account
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
