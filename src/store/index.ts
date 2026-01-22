// Zustand stores for state management
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { signOut as authSignOut, getUserProfile } from "@/lib/auth";
import type { UserProfile } from "@/types/supabase";
import type { User, Session } from "@supabase/supabase-js";

// ============================================
// AUTH STORE
// ============================================

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),

  initialize: async () => {
    try {
      // Get current session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error);
        set({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          isInitialized: true,
        });
        return;
      }

      if (session?.user) {
        // Fetch user profile
        const profile = await getUserProfile(session.user.id);
        set({
          user: session.user,
          session,
          profile,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          isInitialized: true,
        });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state changed:", event);

        if (event === "SIGNED_IN" && session?.user) {
          const profile = await getUserProfile(session.user.id);
          set({ user: session.user, session, profile });
        } else if (event === "SIGNED_OUT") {
          set({ user: null, session: null, profile: null });
        } else if (event === "TOKEN_REFRESHED" && session) {
          set({ session });
        } else if (event === "USER_UPDATED" && session?.user) {
          const profile = await getUserProfile(session.user.id);
          set({ user: session.user, profile });
        }
      });
    } catch (err) {
      console.error("Initialize error:", err);
      set({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await authSignOut();
    set({ user: null, session: null, profile: null, isLoading: false });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (user) {
      const profile = await getUserProfile(user.id);
      set({ profile });
    }
  },
}));

// ============================================
// EXAM STORE
// ============================================

interface ExamState {
  currentExamId: string | null;
  answers: Record<string, string>;
  timeRemaining: number;
  isSubmitting: boolean;

  // Actions
  setCurrentExam: (examId: string | null) => void;
  setAnswer: (questionId: string, answer: string) => void;
  clearAnswers: () => void;
  setTimeRemaining: (time: number) => void;
  setSubmitting: (submitting: boolean) => void;
}

export const useExamStore = create<ExamState>((set) => ({
  currentExamId: null,
  answers: {},
  timeRemaining: 0,
  isSubmitting: false,

  setCurrentExam: (examId) => set({ currentExamId: examId, answers: {} }),
  setAnswer: (questionId, answer) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: answer } })),
  clearAnswers: () => set({ answers: {}, currentExamId: null }),
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setSubmitting: (submitting) => set({ isSubmitting: submitting }),
}));

// ============================================
// UI STORE
// ============================================

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  notifications: Notification[];

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
}

interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: "light",
      notifications: [],

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            { ...notification, id: Date.now().toString() },
          ],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
    }),
    {
      name: "eduassess-ui",
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    },
  ),
);
