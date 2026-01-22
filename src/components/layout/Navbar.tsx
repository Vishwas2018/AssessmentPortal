import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  LayoutDashboard,
  FileText,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { ROUTES } from "@/data/constants";
import { useAuthStore } from "@/store";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  const navLinks = [
    { path: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
    { path: ROUTES.EXAMS, label: "Exams", icon: FileText },
    { path: ROUTES.RESULTS, label: "Results", icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Get display name from profile or user metadata
  const displayName =
    profile?.full_name ||
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Student";

  // Get initials for avatar
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b-4 border-primary-400 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to={ROUTES.DASHBOARD} className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary-500 to-purple-500 p-2 rounded-xl shadow-md">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              EduAssess
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all ${
                  isActive(link.path)
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Profile Dropdown */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">{displayName}</p>
                {profile?.year_level && (
                  <p className="text-xs text-gray-500">
                    Year {profile.year_level}
                  </p>
                )}
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden"
                >
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="font-bold text-gray-800 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <div className="p-2">
                    <Link
                      to={ROUTES.PROFILE}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all"
                    >
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold text-gray-700">
                        My Profile
                      </span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-all text-red-600"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-semibold">Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 py-4"
            >
              {/* User Info */}
              <div className="flex items-center space-x-3 px-4 py-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{displayName}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              {/* Nav Links */}
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-bold ${
                      isActive(link.path)
                        ? "bg-primary-100 text-primary-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                ))}

                <Link
                  to={ROUTES.PROFILE}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100"
                >
                  <User className="h-5 w-5" />
                  <span>My Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close dropdown */}
      {profileDropdownOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setProfileDropdownOpen(false)}
        />
      )}
    </nav>
  );
}
