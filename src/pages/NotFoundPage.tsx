import { Link } from "react-router-dom";
import { ROUTES } from "@/data/constants";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link to={ROUTES.HOME} className="btn btn-primary">
          Go Home
        </Link>
      </div>
    </div>
  );
}
