import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Layout Elements
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuraBot from "./components/AuraBot";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import CategoryProducts from "./pages/CategoryProducts";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

function AppContent() {
  const location = useLocation();
  // We don't want a footer on the product detail page
  const isProductDetailsPage = location.pathname.startsWith("/product/");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50" id="main-application-frame">
      {/* Unified Sticky Header */}
      <Navbar />

      {/* View Port routing content */}
      <main className="flex-grow">
        <Routes>
          {/* Public Pathways */}
          <Route path="/" element={<Products />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/category/:categoryName" element={<CategoryProducts />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/cart" element={<Cart />} />

          {/* Logged-In Customer Guarded Pathway */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Administrator Guarded Pathways */}
          <Route
            path="/add-product"
            element={
              <ProtectedRoute adminOnly={true}>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-product/:id"
            element={
              <ProtectedRoute adminOnly={true}>
                <EditProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch */}
          <Route path="*" element={<Products />} />
        </Routes>
      </main>

      {/* Beautiful Page Footer - hidden on product details page */}
      {!isProductDetailsPage && <Footer />}

      {/* Aura Conversational RAG Support Assistant */}
      <AuraBot />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
