import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "❌ Missing Supabase credentials!\n" +
      "Please check your .env file has:\n" +
      "  VITE_SUPABASE_URL=https://xxxxx.supabase.co\n" +
      "  VITE_SUPABASE_ANON_KEY=your_anon_key",
  );
}

// Create Supabase client with auth configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Store session in localStorage
    persistSession: true,
    // Auto-refresh tokens before they expire
    autoRefreshToken: true,
    // Detect session from URL (for OAuth redirects)
    detectSessionInUrl: true,
    // Storage key for session
    storageKey: "eduassess-auth",
  },
});

// Helper to get current user
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting user:", error.message);
    return null;
  }
  return user;
};

// Helper to get current session
export const getCurrentSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting session:", error.message);
    return null;
  }
  return session;
};

// Helper to get user profile from our custom table
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error getting profile:", error.message);
    return null;
  }
  return data;
};

// Auth state change listener type
export type AuthChangeCallback = (event: string, session: any) => void;

// Subscribe to auth changes
export const onAuthStateChange = (callback: AuthChangeCallback) => {
  return supabase.auth.onAuthStateChange(callback);
};

export default supabase;
