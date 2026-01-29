// Router configuration with all routes including pricing/subscription
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

// Protected Pages
import DashboardPage from "@/pages/DashboardPage";
import ExamsPage from "@/pages/ExamsPage";
import ExamStartPage from "@/pages/ExamStartPage";
import TakeExamPageComplete from "@/pages/TakeExamPage"; // Updated import
import ExamResultsPage from "@/pages/ExamResultsPage";
import ResultsPage from "@/pages/ResultsPage";
import ProfilePage from "@/pages/ProfilePage";
import SubscriptionSuccessPage from "@/pages/SubscriptionSuccessPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Public Routes
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

      // Protected Routes
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
            element: <TakeExamPageComplete />, // Updated to use new component
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
        ], // This closing bracket was missing in your original!
      },

      // Catch all - redirect to home
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
