import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import AdminLogin from "./AdminLogin";
import LoadingSpinner from "../ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = true,
}) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 mt-4">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // If no user is logged in, show login form
  if (!user) {
    return <AdminLogin />;
  }

  // If admin access is required but user is not admin
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-8 shadow-2xl">
            <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-6">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Access Denied
            </h2>
            <p className="text-gray-400 mb-6">
              You don't have permission to access this area. This section is
              restricted to administrators only.
            </p>
            <div className="bg-matte-black/50 border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                <span className="font-medium">Current Role:</span> {user.role}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                <span className="font-medium">Email:</span> {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has proper permissions
  return <>{children}</>;
};

export default ProtectedRoute;
