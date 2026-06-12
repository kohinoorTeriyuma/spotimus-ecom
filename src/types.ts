export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  title?: string;
}

export interface Product {
  _id: string;
  id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  title: string;
  image: string;
  stock: number;
}
