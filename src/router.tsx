import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import RootLayout from "@/components/layout/RootLayout";
import ProtectedLayout from "@/components/layout/ProtectedLayout";

// Pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import ExamsPage from "@/pages/ExamsPage";
import ExamStartPage from "@/pages/ExamStartPage";
import ExamPage from "@/pages/ExamPage";
import ExamResultsPage from "@/pages/ExamResultsPage";
import ResultsPage from "@/pages/ResultsPage";
import ProfilePage from "@/pages/ProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Public routes
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

      // Protected routes (require authentication)
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
            path: "exam/:examId",
            element: <ExamStartPage />,
          },
          {
            path: "exam/:examId/take/:attemptId",
            element: <ExamPage />,
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
        ],
      },

      // Catch-all redirect
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
