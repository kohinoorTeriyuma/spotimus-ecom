import { create } from "zustand";
import { CartItem, Product } from "../types";

interface CartState {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

export const useCartStore = create<CartState>((set, get) => {
  const calculateCountAndTotal = (items: CartItem[]) => {
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    return { cartCount, cartTotal };
  };

  const initialItems: CartItem[] = [];
  const { cartCount, cartTotal } = calculateCountAndTotal(initialItems);

  return {
    cartItems: initialItems,
    cartCount,
    cartTotal,

    addToCart: (product, quantity = 1) => {
      const { cartItems } = get();
      const productId = product._id || product.id || "";
      const existing = cartItems.find((item) => item.productId === productId);

      let newItems: CartItem[];
      if (existing) {
        newItems = cartItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          productId,
          title: product.title,
          price: product.price,
          image: product.image,
          quantity,
          stock: product.stock,
        };
        newItems = [...cartItems, newItem];
      }

      set({
        cartItems: newItems,
        ...calculateCountAndTotal(newItems),
      });
    },

    increaseQuantity: (productId) => {
      const { cartItems } = get();
      const newItems = cartItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
          : item
      );

      set({
        cartItems: newItems,
        ...calculateCountAndTotal(newItems),
      });
    },

    decreaseQuantity: (productId) => {
      const { cartItems } = get();
      const newItems = cartItems
        .map((item) => {
          if (item.productId === productId) {
            const nextQty = item.quantity - 1;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      set({
        cartItems: newItems,
        ...calculateCountAndTotal(newItems),
      });
    },

    removeFromCart: (productId) => {
      const { cartItems } = get();
      const newItems = cartItems.filter((item) => item.productId !== productId);

      set({
        cartItems: newItems,
        ...calculateCountAndTotal(newItems),
      });
    },

    clearCart: () => {
      set({
        cartItems: [],
        cartCount: 0,
        cartTotal: 0,
      });
    },
  };
});

