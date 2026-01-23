import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  LayoutDashboard,
  FileText,
  BarChart3,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Settings,
  Star,
} from "lucide-react";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/data/constants";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.HOME);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    {
      path: ROUTES.DASHBOARD,
      label: "Dashboard",
      icon: LayoutDashboard,
      emoji: "🏠",
    },
    { path: ROUTES.EXAMS, label: "Exams", icon: FileText, emoji: "📝" },
    { path: ROUTES.RESULTS, label: "Results", icon: BarChart3, emoji: "📊" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Get display name from profile or user metadata
  const displayName =
    profile?.full_name ||
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Student";

  // Get year level
  const yearLevel =
    profile?.year_level || user?.user_metadata?.year_level || "";

  // Get initials for avatar
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b-4 border-indigo-400 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center space-x-3 group"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg"
            >
              <BookOpen className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              EduAssess
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={`nav-link-${link.path}`}
                to={link.path}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
                  isActive(link.path)
                    ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-indigo-600"
                }`}
              >
                <span className="text-lg">{link.emoji}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Profile Dropdown */}
          <div className="hidden md:block relative" ref={dropdownRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all border-2 border-transparent hover:border-indigo-200"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md text-sm">
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
                <p className="font-bold text-gray-800 text-sm">{displayName}</p>
                {yearLevel && (
                  <p className="text-xs text-indigo-500 font-medium">
                    Year {yearLevel}
                  </p>
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  profileDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border-2 border-gray-100 py-2 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-bold text-gray-800">{displayName}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      key="dropdown-profile"
                      to={ROUTES.PROFILE}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="font-medium">My Profile</span>
                    </Link>
                    <Link
                      key="dropdown-achievements"
                      to={ROUTES.DASHBOARD}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <Star className="w-4 h-4" />
                      <span className="font-medium">Achievements</span>
                    </Link>
                    <Link
                      key="dropdown-settings"
                      to={ROUTES.PROFILE}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="font-medium">Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Log Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 py-4"
            >
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={`mobile-nav-${link.path}`}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all ${
                      isActive(link.path)
                        ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-xl">{link.emoji}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}

                <div className="border-t border-gray-100 pt-4 mt-4">
                  <Link
                    key="mobile-profile"
                    to={ROUTES.PROFILE}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 font-bold"
                  >
                    <User className="w-5 h-5" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-bold w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
