import { Link } from "react-router-dom";
import { ROUTES } from "@/data/constants";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6">Sign Up</h2>
        <p className="text-center text-gray-600 mb-4">
          Signup page will be implemented in Phase 2
        </p>
        <Link
          to={ROUTES.LOGIN}
          className="block text-center text-primary-600 hover:text-primary-700"
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
