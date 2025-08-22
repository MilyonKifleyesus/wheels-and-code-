import React, { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Database,
  User,
  Mail,
  Sprout,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { seedDatabase } from "../../lib/seed";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("mili.kifleyesus@gmail.com");
  const [password, setPassword] = useState("P@ssw0rd123!");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();

  const { signIn, resetPassword, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    console.log("🔐 Admin login attempt starting...");

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setError(
        "Supabase environment variables not configured. Please check your .env file."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      setSuccess("Signing in...");

      const result = await signIn(email, password);

      if (result.success) {
        console.log("✅ Admin login successful!");
        setSuccess("Login successful! Redirecting...");
        setError("");

        // Use router navigation instead of page reload
        setTimeout(() => {
          navigate("/admin", { replace: true });
          setIsSubmitting(false);
        }, 1000);
      } else {
        console.error("❌ Admin login failed:", result.error);
        setError(result.error || "Login failed. Please try again.");
        setSuccess("");
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error("❌ Login error:", error);
      setError("Login system error. Please try again.");
      setSuccess("");
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError("Please enter your email address");
      return;
    }

    try {
      const result = await resetPassword(resetEmail);
      if (result.success) {
        setSuccess("Password reset email sent! Check your inbox.");
        setError("");
        setShowForgotPassword(false);
      } else {
        setError(result.error || "Failed to send reset email");
      }
    } catch (error: any) {
      setError("Password reset failed. Please try again.");
    }
  };
  const fillAdminCredentials = () => {
    setEmail("mili.kifleyesus@gmail.com");
    setPassword("P@ssw0rd123!");
    setError("");
    setSuccess("Admin credentials filled. Click 'Sign In' to continue.");
  };

  const testConnection = async () => {
    setSuccess("Testing database connection...");
    setError("");

    try {
      const { testSupabaseConnection, getConfigurationStatus } = await import(
        "../../lib/supabase"
      );

      // First check configuration
      const config = getConfigurationStatus();
      console.log("📊 Configuration Status:", config);

      if (!config.isConfigured) {
        setError(`Environment variables not configured properly:
        - URL: ${config.hasUrl ? "✅" : "❌"} 
        - Key: ${config.hasKey ? "✅" : "❌"}
        - Client: ${config.hasClient ? "✅" : "❌"}`);
        setSuccess("");
        return;
      }

      // Test connection
      const result = await testSupabaseConnection();

      if (!result.success) {
        setError(`Database connection failed: ${result.error}`);
        setSuccess("");
      } else {
        setSuccess(
          `✅ Database connection successful! ${
            result.session ? "Active session found" : "Ready for authentication"
          }`
        );
        setError("");
      }
    } catch (err: any) {
      setError(`Connection test failed: ${err.message}`);
      setSuccess("");
    }
  };

  const handleSeedDatabase = async () => {
    setSuccess("Attempting to seed database with default content...");
    setError("");
    setIsSubmitting(true);
    try {
      const result = await seedDatabase();
      if (result.success) {
        setSuccess(result.message || "Database seeded successfully!");
        setError("");
      } else {
        setError(result.error || "Failed to seed database.");
        setSuccess("");
      }
    } catch (err: any) {
      setError(`Seeding failed: ${err.message}`);
      setSuccess("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-matte-black flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-acid-yellow rounded-full flex items-center justify-center mb-6">
              <Mail className="h-8 w-8 text-black" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-wider">
              RESET PASSWORD
            </h2>
            <p className="mt-2 text-gray-400 text-sm">
              Enter your email to receive reset instructions
            </p>
          </div>

          <div className="bg-dark-graphite border border-gray-800 rounded-lg p-8 shadow-2xl">
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center space-x-3 mb-6">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 flex items-center space-x-3 mb-6">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-green-400 text-sm">{success}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label
                  htmlFor="resetEmail"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="resetEmail"
                  name="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-matte-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-acid-yellow focus:border-transparent transition-all duration-200"
                  placeholder="mili.kifleyesus@gmail.com"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1 bg-gray-700 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-acid-yellow text-black font-bold py-3 px-4 rounded-lg hover:bg-yellow-400 transition-colors duration-200"
                >
                  Send Reset Email
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-matte-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-acid-yellow rounded-full flex items-center justify-center mb-6">
            <Lock className="h-8 w-8 text-black" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-wider">
            ADMIN ACCESS
          </h2>
          <p className="mt-2 text-gray-400 text-sm">
            Business Management System
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-8 shadow-2xl">
          {/* Quick Actions */}
          <div className="mb-6 space-y-3">
            <button
              type="button"
              onClick={fillAdminCredentials}
              disabled={isSubmitting}
              className="w-full bg-acid-yellow/10 border border-acid-yellow/20 text-acid-yellow py-2 px-4 rounded-sm text-sm font-medium hover:bg-acid-yellow/20 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Use Default Admin Credentials</span>
            </button>

            <button
              type="button"
              onClick={testConnection}
              disabled={isSubmitting}
              className="w-full bg-blue-600/10 border border-blue-600/20 text-blue-400 py-2 px-4 rounded-sm text-sm font-medium hover:bg-blue-600/20 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Database className="w-4 h-4" />
              <span>Test Database Connection</span>
            </button>

            <button
              type="button"
              onClick={handleSeedDatabase}
              disabled={isSubmitting}
              className="w-full bg-green-600/10 border border-green-600/20 text-green-400 py-2 px-4 rounded-sm text-sm font-medium hover:bg-green-600/20 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Sprout className="w-4 h-4" />
              <span>Seed Database with Default Content (Run Once)</span>
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-green-400 text-sm">{success}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-matte-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-acid-yellow focus:border-transparent transition-all duration-200 disabled:opacity-50"
                placeholder="admin@company.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-matte-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-acid-yellow focus:border-transparent transition-all duration-200 pr-12 disabled:opacity-50"
                  placeholder="P@ssw0rd123!"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-acid-yellow hover:text-neon-lime transition-colors duration-200"
              >
                Forgot your password?
              </button>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-acid-yellow text-black font-bold py-3 px-4 rounded-lg hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-acid-yellow focus:ring-offset-2 focus:ring-offset-dark-graphite transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                "Sign In to Admin Panel"
              )}
            </button>
          </form>

          {/* Debug Info */}
          <div className="mt-6 p-4 bg-matte-black/50 border border-gray-700 rounded-lg">
            <h4 className="text-gray-300 font-medium text-sm mb-2">
              Default Credentials:
            </h4>
            <div className="text-xs text-gray-400 space-y-1">
              <p>
                <strong>Email:</strong> mili.kifleyesus@gmail.com
              </p>
              <p>
                <strong>Password:</strong> P@ssw0rd123!
              </p>
              <p className="text-acid-yellow mt-2">
                These credentials are pre-filled for testing
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-500 text-xs">
            © 2024 Apex Auto Sales & Repair. Secure Admin System.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
