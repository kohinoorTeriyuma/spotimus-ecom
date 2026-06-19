import React, { useEffect, ReactNode } from "react";
import { useAuthStore } from "../store/useAuthStore";

export function AuthProvider({ children }: { children: ReactNode }) {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  // Automatically fetch profile on direct load to authenticate via secure database cookies
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return <>{children}</>;
}

export function useAuth() {
  return useAuthStore();
}
