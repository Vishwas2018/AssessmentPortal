import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROUTES } from "@/data/constants";

// Layouts
import RootLayout from "@/components/layout/RootLayout";
import ProtectedLayout from "@/components/layout/ProtectedLayout";

// Pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import ExamsPage from "@/pages/ExamsPage";
import ProfilePage from "@/pages/ProfilePage";

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
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.REGISTER,
        element: <RegisterPage />,
      },
      // Protected routes
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: <DashboardPage />,
          },
          {
            path: ROUTES.EXAMS,
            element: <ExamsPage />,
          },
          {
            path: ROUTES.PROFILE,
            element: <ProfilePage />,
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
