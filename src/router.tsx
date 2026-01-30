// src/router.tsx
// Router configuration with all routes including OAuth callback
// FIXED: Added auth/callback route for OAuth redirects
// ============================================

import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "@/components/layout/RootLayout";
import ProtectedLayout from "@/components/layout/ProtectedLayout";

// Public Pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import PricingPage from "@/pages/PricingPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage"; // NEW: OAuth callback handler

// Protected Pages
import DashboardPage from "@/pages/DashboardPage";
import ExamsPage from "@/pages/ExamsPage";
import ExamStartPage from "@/pages/ExamStartPage";
import TakeExamPage from "@/pages/TakeExamPage";
import ExamResultsPage from "@/pages/ExamResultsPage";
import ResultsPage from "@/pages/ResultsPage";
import ProfilePage from "@/pages/ProfilePage";
import SubscriptionSuccessPage from "@/pages/SubscriptionSuccessPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // ============================================
      // PUBLIC ROUTES
      // ============================================
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "pricing",
        element: <PricingPage />,
      },
      // NEW: OAuth callback route - handles redirect after Google/Microsoft sign-in
      {
        path: "auth/callback",
        element: <AuthCallbackPage />,
      },

      // ============================================
      // PROTECTED ROUTES
      // ============================================
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "exams",
            element: <ExamsPage />,
          },
          {
            path: "exam/:examId/start",
            element: <ExamStartPage />,
          },
          {
            path: "exam/:examId/take/:attemptId",
            element: <TakeExamPage />,
          },
          {
            path: "exam/:examId/results/:attemptId",
            element: <ExamResultsPage />,
          },
          {
            path: "results",
            element: <ResultsPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
          {
            path: "subscription/success",
            element: <SubscriptionSuccessPage />,
          },
        ],
      },

      // ============================================
      // FALLBACK ROUTES
      // ============================================
      // Catch all - redirect to home
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
