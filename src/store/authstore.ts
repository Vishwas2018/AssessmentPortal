// src/store/authStore.ts
// Simple authentication store using Zustand
// ============================================

import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set({
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
        });
      });
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ loading: false, initialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
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

  signUp: async (
    email: string,
    password: string,
    metadata?: Record<string, unknown>,
  ) => {
    set({ loading: true });
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
        loading: false,
      });
      return { error: null };
    } catch (error) {
      set({ loading: false });
      return { error: error as Error };
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({
        user: null,
        session: null,
        loading: false,
      });
    } catch (error) {
      console.error("Sign out error:", error);
      set({ loading: false });
    }
  },
}));

// Helper hooks
export const useIsAuthenticated = () => {
  const user = useAuthStore((state) => state.user);
  return !!user;
};

export const useUserProfile = () => {
  const user = useAuthStore((state) => state.user);
  return user;
};
