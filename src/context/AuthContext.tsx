import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import API from "../services/api";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated and has title "admin"
  const isAdmin = user ? user.title?.toLowerCase() === "admin" : false;

  const clearError = () => setError(null);

  // On initial mount, fetch profile details if token is found
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const res = await API.get("/auth/profile");
          setUser(res.data.user);
        } catch (err: any) {
          console.warn("Token validation failed. Session cleared.");
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post("/auth/login", { email, password });
      const { token: userToken, user: resUser } = res.data;

      localStorage.setItem("token", userToken);
      setToken(userToken);
      setUser(resUser);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Invalid credentials.";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post("/auth/register", { name, email, password });
      const { token: userToken, user: resUser } = res.data;

      localStorage.setItem("token", userToken);
      setToken(userToken);
      setUser(resUser);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Registration failed.";
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAdmin,
    login,
    register,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
