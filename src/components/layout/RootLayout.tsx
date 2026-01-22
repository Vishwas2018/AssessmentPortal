import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store";

export default function RootLayout() {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    // Initialize auth state
    setLoading(false);
  }, [setUser, setLoading]);

  return (
    <div className="min-h-screen flex flex-col">
      <Outlet />
    </div>
  );
}
