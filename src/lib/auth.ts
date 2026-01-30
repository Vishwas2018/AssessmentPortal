// src/lib/auth.ts
// Authentication service - handles all Supabase auth operations
// FIXED: Proper OAuth redirect handling for Google sign-in

import { supabase } from "./supabase";
import type { UserProfile } from "../types/supabase";

// ============================================
// TYPES
// ============================================

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  yearLevel?: number;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: any;
  session?: any;
}

// ============================================
// SIGN UP
// ============================================

export async function signUp(data: SignUpData): Promise<AuthResult> {
  try {
    // 1. Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          year_level: data.yearLevel,
        },
        // Redirect after email confirmation
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
      },
    });

    if (authError) {
      console.error("Signup error:", authError);
      return {
        success: false,
        error: getReadableError(authError.message),
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Failed to create account. Please try again.",
      };
    }

    // 2. Update profile with year level if provided
    if (data.yearLevel && authData.user) {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          year_level: data.yearLevel,
          full_name: data.fullName,
        } as never)
        .eq("id", authData.user.id);

      if (profileError) {
        console.warn("Profile update warning:", profileError);
        // Don't fail signup if profile update fails
      }
    }

    return {
      success: true,
      user: authData.user,
      session: authData.session,
    };
  } catch (err) {
    console.error("Unexpected signup error:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

// ============================================
// SIGN IN
// ============================================

export async function signIn(data: SignInData): Promise<AuthResult> {
  try {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (authError) {
      console.error("Login error:", authError);
      return {
        success: false,
        error: getReadableError(authError.message),
      };
    }

    return {
      success: true,
      user: authData.user,
      session: authData.session,
    };
  } catch (err) {
    console.error("Unexpected login error:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

// ============================================
// SIGN OUT
// ============================================

export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return {
        success: false,
        error: getReadableError(error.message),
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected logout error:", err);
    return {
      success: false,
      error: "An unexpected error occurred.",
    };
  }
}

// ============================================
// PASSWORD RESET
// ============================================

export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error("Password reset error:", error);
      return {
        success: false,
        error: getReadableError(error.message),
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected password reset error:", err);
    return {
      success: false,
      error: "An unexpected error occurred.",
    };
  }
}

// ============================================
// UPDATE PASSWORD (after reset)
// ============================================

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Update password error:", error);
      return {
        success: false,
        error: getReadableError(error.message),
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected update password error:", err);
    return {
      success: false,
      error: "An unexpected error occurred.",
    };
  }
}

// ============================================
// GET CURRENT USER & PROFILE
// ============================================

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session) return null;
  return session;
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Get profile error:", error);
    return null;
  }

  return data;
}

// ============================================
// SOCIAL AUTH (Google, Microsoft)
// ============================================

/**
 * Sign in with Google OAuth
 *
 * IMPORTANT: For this to work, you must configure the following:
 *
 * 1. In Google Cloud Console (https://console.cloud.google.com):
 *    - Go to APIs & Services → Credentials
 *    - Edit your OAuth 2.0 Client ID
 *    - Add these Authorized redirect URIs:
 *      - https://YOUR_PROJECT.supabase.co/auth/v1/callback
 *      - http://localhost:5173 (for local dev)
 *
 * 2. In Supabase Dashboard:
 *    - Go to Authentication → URL Configuration
 *    - Set Site URL to your production domain
 *    - Add redirect URLs for all environments
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // CRITICAL: The redirectTo should be your app URL where users land after auth
        // Supabase will handle the OAuth callback internally, then redirect here
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Google OAuth error:", error);
      return {
        success: false,
        error: getReadableError(error.message),
      };
    }

    // OAuth initiates a redirect, so we won't reach here normally
    return { success: true };
  } catch (err) {
    console.error("Google sign in error:", err);
    return {
      success: false,
      error: "Failed to sign in with Google. Please try again.",
    };
  }
}

export async function signInWithMicrosoft(): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "email profile",
      },
    });

    if (error) {
      return {
        success: false,
        error: getReadableError(error.message),
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Microsoft sign in error:", err);
    return {
      success: false,
      error: "Failed to sign in with Microsoft.",
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getReadableError(message: string): string {
  // Convert Supabase error messages to user-friendly messages
  const errorMap: Record<string, string> = {
    "Invalid login credentials":
      "Incorrect email or password. Please try again.",
    "Email not confirmed":
      "Please check your email and click the verification link.",
    "User already registered":
      "An account with this email already exists. Try logging in!",
    "Password should be at least 6 characters":
      "Password must be at least 6 characters long.",
    "Unable to validate email address: invalid format":
      "Please enter a valid email address.",
    "Email rate limit exceeded":
      "Too many attempts. Please wait a few minutes and try again.",
    "For security purposes, you can only request this once every 60 seconds":
      "Please wait a moment before trying again.",
    "Invalid Refresh Token: Refresh Token Not Found":
      "Your session has expired. Please log in again.",
    redirect_uri_mismatch: "OAuth configuration error. Please contact support.",
  };

  return errorMap[message] || message;
}

// ============================================
// AUTH STATE LISTENER
// ============================================

export function onAuthStateChange(
  callback: (event: string, session: any) => void,
) {
  return supabase.auth.onAuthStateChange(callback);
}
