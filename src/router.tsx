import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "./components/layout/RootLayout";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ExamsPage from "./pages/ExamsPage"; // This is the exam LISTING page
import ExamStartPage from "./pages/ExamStartPage";
import ExamPage from "./pages/ExamPage"; // This is the exam TAKING page
import ExamResultsPage from "./pages/ExamResultsPage";
import ResultsPage from "./pages/ResultsPage";
import ProfilePage from "./pages/ProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
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
        // Protected routes - require authentication
        element: <ProtectedLayout />,
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            // IMPORTANT: This route shows the list of exams
            path: "exams",
            element: <ExamsPage />,
          },
          {
            // This route shows exam info before starting
            path: "exam/:examId/start",
            element: <ExamStartPage />,
          },
          {
            // This route is for TAKING the exam (with questions)
            path: "exam/:examId/take/:attemptId",
            element: <ExamPage />,
          },
          {
            // This route shows results after completing an exam
            path: "exam/:examId/results/:attemptId",
            element: <ExamResultsPage />,
          },
          {
            // This route shows all past results
            path: "results",
            element: <ResultsPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
        ],
      },
      {
        // Catch-all redirect to home
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
