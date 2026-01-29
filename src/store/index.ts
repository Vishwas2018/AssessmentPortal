import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Types
interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
  year_level?: number;
  school_name?: string;
  parent_email?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (
    updates: Partial<UserProfile>,
  ) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setSession: (session) => set({ session }),

      setProfile: (profile) => set({ profile }),

      setLoading: (isLoading) => set({ isLoading }),

      fetchProfile: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (error) {
            if (error.code === "PGRST116") {
              console.log("Profile not found, user may be new");
              return;
            }
            console.error("Error fetching profile:", error);
            return;
          }

          set({ profile: data as UserProfile });
        } catch (err) {
          console.error("Error in fetchProfile:", err);
        }
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        const { user } = get();
        if (!user) return { error: new Error("No user logged in") };

        try {
          // Use type assertion to bypass strict Supabase typing
          const updatePayload = {
            ...updates,
            updated_at: new Date().toISOString(),
          };

          const { error } = await supabase
            .from("user_profiles")
            .update(updatePayload as never)
            .eq("id", user.id);

          if (error) {
            console.error("Error updating profile:", error);
            return { error };
          }

          const currentProfile = get().profile;
          set({
            profile: currentProfile
              ? ({ ...currentProfile, ...updates } as UserProfile)
              : null,
          });

          return { error: null };
        } catch (err) {
          console.error("Error in updateProfile:", err);
          return { error: err as Error };
        }
      },

      refreshProfile: async () => {
        const { user } = get();
        if (!user) return;
        await get().fetchProfile(user.id);
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
          set({
            user: null,
            session: null,
            profile: null,
            isAuthenticated: false,
          });
        } catch (err) {
          console.error("Error logging out:", err);
        }
      },

      reset: () =>
        set({
          user: null,
          session: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// ============================================
// UI Store
// ============================================
interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  theme: "light",
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));

// ============================================
// Exam Store
// ============================================
interface ExamState {
  currentExamId: string | null;
  currentAttemptId: string | null;
  answers: Record<string, string>;
  flaggedQuestions: Set<string>;
  timeRemaining: number;

  setCurrentExam: (examId: string, attemptId: string) => void;
  setAnswer: (questionId: string, answer: string) => void;
  toggleFlag: (questionId: string) => void;
  setTimeRemaining: (time: number) => void;
  resetExam: () => void;
}

export const useExamStore = create<ExamState>((set) => ({
  currentExamId: null,
  currentAttemptId: null,
  answers: {},
  flaggedQuestions: new Set(),
  timeRemaining: 0,

  setCurrentExam: (examId, attemptId) =>
    set({
      currentExamId: examId,
      currentAttemptId: attemptId,
      answers: {},
      flaggedQuestions: new Set(),
    }),

  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),

  toggleFlag: (questionId) =>
    set((state) => {
      const newFlagged = new Set(state.flaggedQuestions);
      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId);
      } else {
        newFlagged.add(questionId);
      }
      return { flaggedQuestions: newFlagged };
    }),

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  resetExam: () =>
    set({
      currentExamId: null,
      currentAttemptId: null,
      answers: {},
      flaggedQuestions: new Set(),
      timeRemaining: 0,
    }),
}));
