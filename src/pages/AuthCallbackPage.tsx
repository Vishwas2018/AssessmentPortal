// src/pages/AuthCallbackPage.tsx
// Handles OAuth callback redirects from Google/Microsoft sign-in
// This page processes the auth tokens and redirects to dashboard

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/data/constants";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setUser, setSession, fetchProfile } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from URL hash (Supabase puts tokens there after OAuth)
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          setStatus("error");
          setErrorMessage(error.message);
          return;
        }

        if (data.session) {
          // Successfully authenticated
          setUser(data.session.user);
          setSession(data.session);

          // Fetch user profile in background
          if (data.session.user.id) {
            fetchProfile(data.session.user.id).catch(console.error);
          }

          setStatus("success");

          // Brief delay to show success state, then redirect
          setTimeout(() => {
            navigate(ROUTES.DASHBOARD, { replace: true });
          }, 1000);
        } else {
          // No session found - might be an error or user cancelled
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1),
          );
          const errorParam = hashParams.get("error");
          const errorDescription = hashParams.get("error_description");

          if (errorParam) {
            setStatus("error");
            setErrorMessage(errorDescription || errorParam);
          } else {
            // No error but no session - redirect to login
            navigate(ROUTES.LOGIN, { replace: true });
          }
        }
      } catch (err) {
        console.error("Auth callback exception:", err);
        setStatus("error");
        setErrorMessage("An unexpected error occurred during sign-in.");
      }
    };

    handleAuthCallback();
  }, [navigate, setUser, setSession, fetchProfile]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
        >
          <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Signing you in...
          </h2>
          <p className="text-gray-600">
            Just a moment while we complete your sign-in! ✨
          </p>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
          >
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome! 🎉</h2>
          <p className="text-gray-600">Redirecting you to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-500 to-purple-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Sign-in Failed 😕
        </h2>
        <p className="text-gray-600 mb-4">
          {errorMessage || "Something went wrong during sign-in."}
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left text-sm text-gray-600">
          <p className="font-semibold mb-2">This might help:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Try signing in again</li>
            <li>Use a different sign-in method</li>
            <li>Clear your browser cookies</li>
            <li>Contact support if the issue persists</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
            className="flex-1 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors"
          >
            Back to Login
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    </div>
  );
}
