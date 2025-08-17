import React, { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Use current form values or default admin credentials
    const loginEmail = email || "admin@company.com";
    const loginPassword = password || "admin123456";

    if (!loginEmail || !loginPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    console.log("Attempting login with:", { email: loginEmail, password: "***" });
    
    // Show loading state
    setError("Signing in...");
    
    const result = await signIn(loginEmail, loginPassword);

    if (!result.success) {
      console.error("Login failed:", result.error);
      setError(result.error || "Login failed. Please check your credentials.");
    } else {
      console.log("✅ Login successful!");
      setError("");
    }

    setLoading(false);
  };

  // Auto-fill admin credentials for testing
  const fillAdminCredentials = () => {
    setEmail("admin@company.com");
    setPassword("admin123456");
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
            Secure Business Control Panel
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-dark-graphite border border-gray-800 rounded-lg p-8 shadow-2xl">
          {/* Quick Login Button */}
          <div className="mb-6 p-4 bg-acid-yellow/10 border border-acid-yellow/20 rounded-lg">
            <p className="text-acid-yellow text-sm mb-2">Quick Admin Login:</p>
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="text-acid-yellow hover:text-white text-sm underline"
            >
              Use Default Admin Credentials
            </button>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
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
                required
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-matte-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-acid-yellow focus:border-transparent transition-all duration-200 pr-12"
                  placeholder="••••••••"
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
                  <span>Authenticating...</span>
                </div>
              ) : (
                "Sign In to Admin Panel"
              )}
            </button>
          </form>

          {/* Setup Instructions */}
          <div className="mt-6">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-acid-yellow hover:text-white text-sm underline"
            >
              Need help setting up? Click here
            </button>
            
            {showInstructions && (
              <div className="mt-4 p-4 bg-matte-black/50 border border-gray-700 rounded-lg text-xs text-gray-400">
                <p className="font-medium text-gray-300 mb-2">Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Create a .env file in your project root</li>
                  <li>Add your Supabase URL and anon key</li>
                  <li>Run the database migrations</li>
                  <li>Use admin@company.com / admin123456 to login</li>
                </ol>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-matte-black/50 border border-gray-700 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-acid-yellow rounded-full mt-2"></div>
              </div>
              <div className="text-xs text-gray-400">
                <p className="font-medium text-gray-300 mb-1">
                  Security Notice
                </p>
                <p>
                  This panel is restricted to authorized personnel only. All
                  access attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-500 text-xs">
            © 2024 Car Sales & Repair. Secure Business Management System.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
