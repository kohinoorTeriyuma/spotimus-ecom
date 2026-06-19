import { create } from "zustand";

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  createdAt: string;
  totalAmount: number;
  status: "Processing" | "Shipped" | "Delivered";
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: "Processing" | "Shipped" | "Delivered") => void;
  deleteOrder: (orderId: string) => void;
  clearAllOrders: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
    })),
  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.orderId === orderId ? { ...o, status } : o
      ),
    })),
  deleteOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.orderId !== orderId),
    })),
  clearAllOrders: () => set({ orders: [] }),
}));
