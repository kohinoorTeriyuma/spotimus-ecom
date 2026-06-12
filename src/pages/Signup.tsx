import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User as UserIcon, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function Signup() {
  const { register, error, clearError, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/profile", { replace: true });
    }
    return () => {
      clearError();
    };
  }, [user, navigate, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!name || !email || !password || !confirmPassword) {
      setLocalError("Please fill in all requested fields.");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password);
    } catch (err: any) {
      // error is populated inside AuthContext, but caught here for safety
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50/50 px-4 py-12" id="signup-page-container">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-100 shadow-xs">
        <div className="text-center">
          <h2 className="text-2xl font-sans font-bold tracking-tight text-gray-950">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Register a free profile to purchase and manage products.
          </p>
        </div>

        {/* Informative credentials note */}
        <div className="mt-5 p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500">
          <p className="font-semibold text-gray-750">⚡ Instant Admin Flag:</p>
          <p className="mt-0.5">
            Use <code className="bg-gray-150 px-1 py-0.5 rounded font-mono text-emerald-600 font-bold">"admin"</code> anywhere in your registration email to gain full dashboard CRUD rights.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Error notifications */}
          {(localError || error) && (
            <div className="flex bg-red-50 text-red-650 p-3 rounded-xl text-xs gap-2 items-center" id="signup-error-message">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Full Name input */}
          <div>
            <label htmlFor="name-input" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative mt-1.5 rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                id="name-input"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Naveen Kumar"
                className="block w-full pl-10 pr-4 py-2.5 sm:text-sm bg-gray-50/50 border border-gray-150 focus:border-black focus:ring-black rounded-xl focus:bg-white outline-hidden transition"
              />
            </div>
          </div>

          {/* Email Address input */}
          <div>
            <label htmlFor="email-signup" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative mt-1.5 rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email-signup"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="block w-full pl-10 pr-4 py-2.5 sm:text-sm bg-gray-50/50 border border-gray-150 focus:border-black focus:ring-black rounded-xl focus:bg-white outline-hidden transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password-signup" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Password
            </label>
            <div className="relative mt-1.5 rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password-signup"
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

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirm-pass-signup" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative mt-1.5 rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirm-pass-signup"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-10 pr-4 py-2.5 sm:text-sm bg-gray-50/50 border border-gray-150 focus:border-black focus:ring-black rounded-xl focus:bg-white outline-hidden transition"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 flex items-center justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-black hover:bg-charcoal transition-all cursor-pointer shadow-sm active:scale-98 disabled:bg-gray-400"
            id="signup-submit-btn"
          >
            {submitting ? "Creating Account..." : "Create Account"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-black hover:underline">
            Log in to session
          </Link>
        </p>
      </div>
    </div>
  );
}
