import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/data/constants";

export default function RootLayout() {
  const [isInitializing, setIsInitializing] = useState(true);
  const { setUser, setSession, setProfile, setLoading, fetchProfile } =
    useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    // Check initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
        }

        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            setSession(session);
            // Fetch profile in background, don't block
            fetchProfile(session.user.id).catch(console.error);
          } else {
            setUser(null);
            setSession(null);
            setProfile(null);
          }
          // Update both local and store loading states
          setIsInitializing(false);
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        if (mounted) {
          setIsInitializing(false);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);

      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          fetchProfile(session.user.id).catch(console.error);

          // Redirect to dashboard after login
          if (event === "SIGNED_IN") {
            const publicPaths = [
              ROUTES.HOME,
              ROUTES.LOGIN,
              ROUTES.REGISTER,
              ROUTES.FORGOT_PASSWORD,
            ];
            if (
              publicPaths.includes(
                location.pathname as
                  | typeof ROUTES.HOME
                  | typeof ROUTES.LOGIN
                  | typeof ROUTES.REGISTER
                  | typeof ROUTES.FORGOT_PASSWORD,
              )
            ) {
              navigate(ROUTES.DASHBOARD as any, { replace: true });
            }
          }
        } else {
          setUser(null);
          setSession(null);
          setProfile(null);

          // Redirect to home after logout
          if (event === "SIGNED_OUT") {
            navigate(ROUTES.HOME as any, { replace: true });
          }
        }
      }
    });

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Show loading spinner during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-xl font-bold">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
}
