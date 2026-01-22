import { createBrowserRouter } from "react-router-dom";

// Layouts
import RootLayout from "@/components/layout/RootLayout";
import ProtectedLayout from "@/components/layout/ProtectedLayout";

// Pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import ExamsPage from "@/pages/ExamsPage";
import ExamStartPage from "@/pages/ExamStartPage";
import ExamPage from "@/pages/ExamPage";
import ExamResultsPage from "@/pages/ExamResultsPage";
import ProfilePage from "@/pages/ProfilePage";

// Placeholder pages (to be built)
const ResultsPage = () => (
  <div className="container-custom py-8">
    <h1 className="text-3xl font-bold">Results History</h1>
    <p className="text-gray-600 mt-4">Your exam history will appear here.</p>
  </div>
);

const PricingPage = () => (
  <div className="container-custom py-8">
    <h1 className="text-3xl font-bold">Pricing</h1>
    <p className="text-gray-600 mt-4">Pricing page coming soon.</p>
  </div>
);

export const router = createBrowserRouter(
  [
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
          path: "pricing",
          element: <PricingPage />,
        },

        // Protected routes
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
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  },
);

export default router;
