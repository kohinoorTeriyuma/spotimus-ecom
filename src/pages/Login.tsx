import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function Login() {
  const { login, error, clearError, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || "/profile";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirectPath, { replace: true });
    }
    return () => {
      clearError();
    };
  }, [user, navigate, redirectPath, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      // navigation is handled by useEffect when user state is mutated
    } catch (err: any) {
      // error is populated inside AuthContext, but caught here for safety
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50/50 px-4 py-12" id="login-page-container">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-100 shadow-xs">
        <div className="text-center">
          <h2 className="text-2xl font-sans font-bold tracking-tight text-gray-950">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter your credentials to manage your cart or catalog.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Error Feedbacks */}
          {(localError || error) && (
            <div className="flex bg-red-50 text-red-650 p-3 rounded-xl text-xs gap-2 items-center" id="login-error-message">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Email input field */}
          <div>
            <label htmlFor="email-input" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative mt-1.5 rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email-input"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="block w-full pl-10 pr-4 py-2.5 sm:text-sm bg-gray-50/50 border border-gray-150 focus:border-black focus:ring-black rounded-xl focus:bg-white outline-hidden transition"
              />
            </div>
          </div>

          {/* Password input field */}
          <div>
            <label htmlFor="password-input" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Password
            </label>
            <div className="relative mt-1.5 rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password-input"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-4 py-2.5 sm:text-sm bg-gray-50/50 border border-gray-150 focus:border-black focus:ring-black rounded-xl focus:bg-white outline-hidden transition"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-black hover:bg-charcoal transition-all cursor-pointer shadow-sm active:scale-98 disabled:bg-gray-400"
            id="login-submit-btn"
          >
            {submitting ? "Signing In..." : "Sign In"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-black hover:underline">
            Register for free
          </Link>
        </p>
      </div>
    </div>
  );
}
