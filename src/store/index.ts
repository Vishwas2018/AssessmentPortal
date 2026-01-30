// src/store/index.ts
// Unified application stores using Zustand
// This is the SINGLE source of truth for auth state
// DELETE the separate authStore.ts file if it exists
// ============================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// ============================================
// TYPES
// ============================================

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

// ============================================
// AUTH STORE
// ============================================

interface AuthState {
  // State
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

  // Compatibility aliases (for components using old store API)
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  initialized: boolean;
  loading: boolean; // Alias for isLoading
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,
      initialized: false,
      loading: true, // Alias

      // ============================================
      // CORE SETTERS
      // ============================================

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setSession: (session) => set({ session }),

      setProfile: (profile) => set({ profile }),

      setLoading: (isLoading) => set({ isLoading, loading: isLoading }),

      // ============================================
      // PROFILE OPERATIONS
      // ============================================

      fetchProfile: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (error) {
            if (error.code === "PGRST116") {
              // Profile not found - user may be new
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

          // Update local state
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

      // ============================================
      // AUTH OPERATIONS
      // ============================================

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
          loading: false,
        }),

      // ============================================
      // COMPATIBILITY METHODS (for old store API)
      // ============================================

      initialize: async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          set({
            session,
            user: session?.user ?? null,
            isAuthenticated: !!session?.user,
            isLoading: false,
            loading: false,
            initialized: true,
          });

          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            set({
              session,
              user: session?.user ?? null,
              isAuthenticated: !!session?.user,
            });
          });

          // Fetch profile if logged in
          if (session?.user) {
            get().fetchProfile(session.user.id);
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          set({ isLoading: false, loading: false, initialized: true });
        }
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, loading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
            isLoading: false,
            loading: false,
          });

          // Fetch profile after login
          if (data.user) {
            get().fetchProfile(data.user.id);
          }

          return { error: null };
        } catch (error) {
          set({ isLoading: false, loading: false });
          return { error: error as Error };
        }
      },

      signUp: async (
        email: string,
        password: string,
        metadata?: Record<string, unknown>,
      ) => {
        set({ isLoading: true, loading: true });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: metadata,
            },
          });
          if (error) throw error;
          set({
            user: data.user,
            session: data.session,
            isAuthenticated: !!data.session,
            isLoading: false,
            loading: false,
          });
          return { error: null };
        } catch (error) {
          set({ isLoading: false, loading: false });
          return { error: error as Error };
        }
      },

      signOut: async () => {
        await get().logout();
      },
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
// UI STORE
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
// EXAM STORE
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

// ============================================
// HELPER HOOKS (for backward compatibility)
// ============================================

export const useIsAuthenticated = () => {
  const user = useAuthStore((state) => state.user);
  return !!user;
};

export const useUserProfile = () => {
  const user = useAuthStore((state) => state.user);
  return user;
};
