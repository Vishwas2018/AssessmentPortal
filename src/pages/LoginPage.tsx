import { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  BookOpen,
  Star,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
} from "lucide-react";
import { ROUTES } from "@/data/constants";
import { signIn, signInWithGoogle, resetPassword } from "@/lib/auth";
import {
  loginSchema,
  forgotPasswordSchema,
  type LoginFormData,
  type ForgotPasswordFormData,
} from "@/lib/validations";
import { useAuthStore } from "@/store";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, isInitialized } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [verifiedMessage, setVerifiedMessage] = useState(false);

  // Get the page user was trying to visit (if any)
  const from = (location.state as any)?.from || ROUTES.DASHBOARD;

  // Redirect if already logged in
  useEffect(() => {
    if (isInitialized && user) {
      navigate(from, { replace: true });
    }
  }, [user, isInitialized, navigate, from]);

  // Check if user just verified their email
  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setVerifiedMessage(true);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: errorsForgot },
    reset: resetForgotForm,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);

    const result = await signIn({
      email: data.email,
      password: data.password,
    });

    setIsLoading(false);

    if (result.success) {
      // Small delay to let auth state update, then navigate
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    } else {
      setServerError(result.error || "Failed to log in");
    }
  };

  const onForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setServerError(null);

    const result = await resetPassword(data.email);

    setIsLoading(false);

    if (result.success) {
      setResetEmailSent(true);
    } else {
      setServerError(result.error || "Failed to send reset email");
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setServerError(null);

    const result = await signInWithGoogle();

    if (!result.success) {
      setIsLoading(false);
      setServerError(result.error || "Failed to sign in with Google");
    }
  };

  // Show loading if checking auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  // Forgot Password Modal
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full"
        >
          {resetEmailSent ? (
            // Success state
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Mail className="w-8 h-8 text-green-500" />
              </motion.div>
              <h2 className="text-2xl font-black text-gray-800 mb-4">
                Check Your Email! 📧
              </h2>
              <p className="text-gray-600 mb-6">
                We've sent password reset instructions to your email address.
              </p>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmailSent(false);
                  resetForgotForm();
                }}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-primary-500 to-purple-500 text-white"
              >
                Back to Login
              </button>
            </div>
          ) : (
            // Form state
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-gray-800 mb-2">
                  Forgot Password? 🔑
                </h2>
                <p className="text-gray-600">
                  No worries! Enter your email and we'll send you reset
                  instructions.
                </p>
              </div>

              {serverError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{serverError}</p>
                </div>
              )}

              <form
                onSubmit={handleSubmitForgot(onForgotPassword)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    {...registerForgot("email")}
                    type="email"
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 rounded-xl border-2 font-semibold ${
                      errorsForgot.email ? "border-red-300" : "border-gray-200"
                    }`}
                  />
                  {errorsForgot.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errorsForgot.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-primary-500 to-purple-500 text-white disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setServerError(null);
                  }}
                  className="w-full py-3 rounded-xl font-bold border-2 border-gray-200 hover:bg-gray-50"
                >
                  Back to Login
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute text-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <Star size={15 + Math.random() * 20} fill="currentColor" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="bg-gradient-to-br from-primary-500 to-purple-500 p-2 rounded-xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              EduAssess
            </span>
          </Link>
          <h1 className="text-3xl font-black text-gray-800 mb-2">
            Welcome Back! 👋
          </h1>
          <p className="text-gray-600 font-semibold">
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Email Verified Message */}
        {verifiedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6 flex items-start space-x-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 font-medium">
              Email verified successfully! You can now log in.
            </p>
          </motion.div>
        )}

        {/* Server Error */}
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 font-medium">{serverError}</p>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email Address 📧
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="your@email.com"
              className={`w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.email
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:border-primary-500"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Password 🔒
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 pr-12 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.password
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 focus:border-primary-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                {...register("rememberMe")}
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600 font-medium">
                Remember me
              </span>
            </label>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-primary-600 hover:underline font-semibold"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl font-black text-lg bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Let's Go! 🚀</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t-2 border-gray-200"></div>
          <span className="px-4 text-gray-500 font-semibold">or</span>
          <div className="flex-1 border-t-2 border-gray-200"></div>
        </div>

        {/* Social Login */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3 rounded-xl font-bold border-2 border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-gray-600 font-semibold">
          Don't have an account?{" "}
          <Link
            to={ROUTES.REGISTER}
            className="text-primary-600 hover:underline font-bold"
          >
            Sign up free!
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
