import { create } from "zustand";
import API from "../services/api";
import { User } from "../types";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  promoteToAdmin: () => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  isAdmin: false,

  clearError: () => set({ error: null }),

  fetchUser: async () => {
    set({ loading: true });
    try {
      const res = await API.get("/auth/profile");
      const fetchedUser = res.data.user;
      set({
        user: fetchedUser,
        isAdmin: fetchedUser ? fetchedUser.title?.toLowerCase() === "admin" : false,
        loading: false,
      });
    } catch (err: any) {
      set({
        user: null,
        isAdmin: false,
        loading: false,
      });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await API.post("/auth/login", { email, password });
      const { user: resUser } = res.data;
      set({
        user: resUser,
        isAdmin: resUser ? resUser.title?.toLowerCase() === "admin" : false,
        loading: false,
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Invalid credentials.";
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await API.post("/auth/register", { name, email, password });
      const { user: resUser } = res.data;
      set({
        user: resUser,
        isAdmin: resUser ? resUser.title?.toLowerCase() === "admin" : false,
        loading: false,
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Registration failed.";
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  promoteToAdmin: async () => {
    set({ loading: true, error: null });
    try {
      const res = await API.post("/auth/make-admin");
      const resUser = res.data.user;
      set({
        user: resUser,
        isAdmin: resUser ? resUser.title?.toLowerCase() === "admin" : true,
        loading: false,
      });
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to elevate permissions.";
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      set({
        user: null,
        isAdmin: false,
        loading: false,
        error: null,
      });
    }
  },
}));
