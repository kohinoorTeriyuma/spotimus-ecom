import React, { ReactNode } from "react";
import { useCartStore } from "../store/useCartStore";

export function CartProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useCart() {
  return useCartStore();
}
