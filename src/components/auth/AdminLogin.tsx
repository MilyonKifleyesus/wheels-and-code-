import React, { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("admin@company.com"); // Pre-fill admin email
  const [password, setPassword] = useState("admin123456"); // Pre-fill admin password
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    console.log("🔐 Admin login attempt starting...");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password ? "***provided***" : "***missing***");

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      setSuccess("Connecting to admin system...");
      
      const result = await signIn(email, password);

      if (result.success) {
        console.log("✅ Admin login successful!");
        setSuccess("Login successful! Redirecting to admin dashboard...");
        setError("");
        
        // Small delay to show success message
        setTimeout(() => {
          window.location.reload(); // Force refresh to ensure admin state is properly set
        }, 1000);
      } else {
        console.error("❌ Admin login failed:", result.error);
        setError(result.error || "Login failed. Please try again.");
        setSuccess("");
      }
    } catch (error: any) {
      console.error("❌ Login error:", error);
      setError("Login system error. Please try again.");
      setSuccess("");
    }

    setLoading(false);
  };

  const fillAdminCredentials = () => {
    setEmail("admin@company.com");
    setPassword("admin123456");
    setError("");
    setSuccess("Admin credentials filled. Click 'Sign In' to continue.");
  };

  const testConnection = async () => {
    setSuccess("Testing database connection...");
    
    try {
      // Test basic connection
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      
      if (error) {
        setError(`Database connection failed: ${error.message}`);
        setSuccess("");
      } else {
        setSuccess(`Database connection successful! Found ${data} profiles.`);
        setError("");
      }
    } catch (err: any) {
      setError(`Connection test failed: ${err.message}`);
      setSuccess("");
    }
  };

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
              className="w-full bg-acid-yellow/10 border border-acid-yellow/20 text-acid-yellow py-2 px-4 rounded-sm text-sm font-medium hover:bg-acid-yellow/20 transition-colors duration-300"
            >
              Use Default Admin Credentials
            </button>
            
            <button
              type="button"
              onClick={testConnection}
              className="w-full bg-blue-600/10 border border-blue-600/20 text-blue-400 py-2 px-4 rounded-sm text-sm font-medium hover:bg-blue-600/20 transition-colors duration-300"
            >
              Test Database Connection
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
                className="w-full px-4 py-3 bg-matte-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-acid-yellow focus:border-transparent transition-all duration-200"
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
                  className="w-full px-4 py-3 bg-matte-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-acid-yellow focus:border-transparent transition-all duration-200 pr-12"
                  placeholder="admin123456"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-acid-yellow text-black font-bold py-3 px-4 rounded-lg hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-acid-yellow focus:ring-offset-2 focus:ring-offset-dark-graphite transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
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
            <h4 className="text-gray-300 font-medium text-sm mb-2">Default Credentials:</h4>
            <div className="text-xs text-gray-400 space-y-1">
              <p><strong>Email:</strong> admin@company.com</p>
              <p><strong>Password:</strong> admin123456</p>
              <p className="text-acid-yellow mt-2">These credentials are pre-filled for testing</p>
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