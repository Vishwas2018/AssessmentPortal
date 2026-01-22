// Protected layout - redirects to login if not authenticated
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ROUTES } from "@/data/constants";
import { useAuthStore } from "@/store";
import Navbar from "./Navbar";

export default function ProtectedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, isInitialized, initialize } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Initialize auth on mount
    const initAuth = async () => {
      if (!isInitialized) {
        await initialize();
      }
      setIsChecking(false);
    };

    initAuth();
  }, [isInitialized, initialize]);

  useEffect(() => {
    // Redirect to login if not authenticated (after initialization is complete)
    if (!isChecking && isInitialized && !isLoading && !user) {
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [user, isLoading, isInitialized, isChecking, navigate, location]);

  // Show loading spinner while checking auth
  if (isChecking || !isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-600">
            Loading your dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-600">
            Redirecting to login...
          </p>
        </motion.div>
      </div>
    );
  }

  // Render protected content
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
