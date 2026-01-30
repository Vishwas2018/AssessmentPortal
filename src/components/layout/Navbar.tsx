// src/components/layout/Navbar.tsx
// Navigation bar with Pricing link added
// ============================================

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Home,
  FileText,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/data/constants";

export default function Navbar() {
  const { user, profile, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isAuthenticated = !!user;

  // Get display name and initials
  const displayName =
    profile?.display_name ||
    profile?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Student";

  const initials = (profile?.full_name || displayName)
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  // Navigation links for authenticated users
  const navLinks = [
    { path: ROUTES.DASHBOARD, label: "Dashboard", icon: Home },
    { path: ROUTES.EXAMS, label: "Exams", icon: FileText },
    { path: ROUTES.RESULTS, label: "Results", icon: BarChart3 },
  ];

  // Check if current path matches
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME}
            className="flex items-center gap-2"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              EduAssess
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${
                      isActive(link.path)
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}

              {/* Pricing Link - Premium Badge */}
              <Link
                to={ROUTES.PRICING}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${
                  isActive(ROUTES.PRICING)
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                    : "text-yellow-600 hover:bg-yellow-50"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Pricing</span>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              {/* Public navigation links */}
              <Link
                to={ROUTES.PRICING}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition"
              >
                <CreditCard className="w-4 h-4" />
                Pricing
              </Link>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {initials}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="font-bold text-gray-800 text-sm">
                        {displayName}
                      </p>
                      {profile?.year_level && (
                        <p className="text-xs text-gray-500">
                          Year {profile.year_level}
                        </p>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition ${profileDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b">
                          <p className="font-bold text-gray-800">
                            {displayName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>

                        <Link
                          to={ROUTES.PROFILE}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                        >
                          <User className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-700">
                            My Profile
                          </span>
                        </Link>

                        <Link
                          to={ROUTES.PRICING}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                        >
                          <Sparkles className="w-5 h-5 text-yellow-500" />
                          <span className="font-medium text-gray-700">
                            Upgrade to Premium
                          </span>
                        </Link>

                        <div className="border-t my-2" />

                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition w-full text-left"
                        >
                          <LogOut className="w-5 h-5 text-red-400" />
                          <span className="font-medium text-red-600">
                            Log Out
                          </span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                {/* Login/Register buttons */}
                <Link
                  to={ROUTES.LOGIN}
                  className="px-4 py-2 font-semibold text-gray-600 hover:text-indigo-600 transition"
                >
                  Log In
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition"
                >
                  Sign Up Free
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t"
            >
              <div className="py-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${
                            isActive(link.path)
                              ? "bg-indigo-100 text-indigo-700"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {link.label}
                        </Link>
                      );
                    })}

                    {/* Mobile Pricing Link */}
                    <Link
                      to={ROUTES.PRICING}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${
                        isActive(ROUTES.PRICING)
                          ? "bg-yellow-100 text-yellow-700"
                          : "text-yellow-600 hover:bg-yellow-50"
                      }`}
                    >
                      <Sparkles className="w-5 h-5" />
                      Pricing
                    </Link>

                    <Link
                      to={ROUTES.PROFILE}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition"
                    >
                      <User className="w-5 h-5" />
                      My Profile
                    </Link>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to={ROUTES.PRICING}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition"
                    >
                      <CreditCard className="w-5 h-5" />
                      Pricing
                    </Link>
                    <Link
                      to={ROUTES.LOGIN}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition"
                    >
                      Log In
                    </Link>
                    <Link
                      to={ROUTES.REGISTER}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white transition"
                    >
                      Sign Up Free
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close dropdown */}
      {profileDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setProfileDropdownOpen(false)}
        />
      )}
    </nav>
  );
}
