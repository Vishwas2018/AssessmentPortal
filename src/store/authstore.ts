// src/store/authStore.ts
// Authentication state management using Zustand
// ============================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      initialized: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),

      initialize: async () => {
        try {
          set({ loading: true });

          // Get current session
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.error("Error getting session:", error);
            set({
              user: null,
              session: null,
              loading: false,
              initialized: true,
            });
            return;
          }

          if (session) {
            set({
              user: session.user,
              session,
              loading: false,
              initialized: true,
            });
          } else {
            set({
              user: null,
              session: null,
              loading: false,
              initialized: true,
            });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            set({
              user: session?.user ?? null,
              session,
              loading: false,
            });
          });
        } catch (error) {
          console.error("Error initializing auth:", error);
          set({ user: null, session: null, loading: false, initialized: true });
        }
      },

      signIn: async (email, password) => {
        try {
          set({ loading: true });

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ loading: false });
            return { error };
          }

          set({
            user: data.user,
            session: data.session,
            loading: false,
          });

          return { error: null };
        } catch (error) {
          set({ loading: false });
          return { error: error as Error };
        }
      },

      signUp: async (email, password, name) => {
        try {
          set({ loading: true });

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name || "",
              },
            },
          });

          if (error) {
            set({ loading: false });
            return { error };
          }

          // If email confirmation is required, user won't be logged in yet
          if (data.user && data.session) {
            set({
              user: data.user,
              session: data.session,
              loading: false,
            });
          } else {
            set({ loading: false });
          }

          return { error: null };
        } catch (error) {
          set({ loading: false });
          return { error: error as Error };
        }
      },

      signOut: async () => {
        try {
          set({ loading: true });
          await supabase.auth.signOut();
          set({ user: null, session: null, loading: false });
        } catch (error) {
          console.error("Error signing out:", error);
          set({ loading: false });
        }
      },

      resetPassword: async (email) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });

          return { error: error as Error | null };
        } catch (error) {
          return { error: error as Error };
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        session: state.session,
      }),
    },
  ),
);

// Export a hook to check if user is authenticated
export const useIsAuthenticated = () => {
  const { user, session } = useAuthStore();
  return !!user && !!session;
};

// Export a hook to get user profile data
export const useUserProfile = () => {
  const { user } = useAuthStore();
  return {
    id: user?.id,
    email: user?.email,
    name:
      user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User",
    avatar: user?.user_metadata?.avatar_url,
  };
};
