import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { Product } from "../types";
import { 
  User, 
  LogOut, 
  ShieldAlert, 
  BadgeCheck, 
  Clock, 
  Mail, 
  Trash2, 
  Edit3, 
  Plus, 
  PackageOpen, 
  RefreshCw,
  PlusCircle,
  Eye
} from "lucide-react";

export default function Profile() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Admin uploaded products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [productError, setProductError] = useState<string | null>(null);

  const fetchAdminProducts = async () => {
    if (!isAdmin || !user?.email) return;
    setLoadingProducts(true);
    setProductError(null);
    try {
      const res = await API.get("/products");
      const creatorEmail = user.email.toLowerCase().trim();
      const filtered = res.data.filter((p: Product) => 
        p.createdBy && p.createdBy.toLowerCase().trim() === creatorEmail
      );
      setProducts(filtered);
    } catch (err: any) {
      console.error("Error loading uploaded products:", err);
      setProductError("Failed to fetch your uploaded items catalog.");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (isAdmin && user?.email) {
      fetchAdminProducts();
    }
  }, [isAdmin, user?.email]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this product?")) {
      return;
    }
    try {
      await API.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not delete this product from database.");
    }
  };

  if (!user) {
    return null; // Safety redirect handled by ProtectedRoute
  }

  return (
    <div className="bg-gray-50/50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans" id="profile-page-view">
      <div className={`mx-auto ${isAdmin ? "max-w-6xl" : "max-w-xl"} transition-all duration-300`}>
        
        {/* Dynamic Multi-Grid Bento-style layout for Admin, standard card for simple user */}
        <div className={`grid gap-8 ${isAdmin ? "lg:grid-cols-3" : "grid-cols-1"}`}>
          
          {/* LEFT COLUMN: Profile Account Information */}
          <div className={`${isAdmin ? "lg:col-span-1" : ""} bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm h-fit`}>
            {/* Header avatar representation */}
            <div className="flex flex-col items-center border-b border-gray-100 pb-6">
              <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center font-sans text-3xl font-extrabold shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="mt-4 text-xl font-sans font-bold text-gray-950">{user.name}</h2>
              <span className="text-xs text-gray-400 font-mono mt-0.5">Joined on {new Date(user.createdAt).toLocaleDateString()}</span>

              {isAdmin ? (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase rounded-full">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> Admin Account Enabled
                </div>
              ) : (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-mono font-bold uppercase rounded-full">
                  Standard Client Profile
                </div>
              )}
            </div>

            {/* Session details */}
            <div className="mt-6 space-y-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Connected Session Details
              </h3>

              <div className="space-y-3.5">
                {/* Registered email */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200/50">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold font-mono">Email Address</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{user.email}</p>
                  </div>
                </div>

                {/* Profile database ID */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200/50">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold font-mono">Profile Database Index ID</p>
                    <p className="text-sm font-mono text-gray-650 mt-0.5 break-all">{user.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin informative Privileges statement */}
            {isAdmin && (
              <div className="mt-6 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 font-sans">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" /> Administrator Privilege Active
                </h4>
                <p className="text-xs text-gray-600 font-sans mt-1 leading-relaxed">
                  As an authorized administrator user, your email matches the secure <code>.env</code> settings. You can manage existing records, publish stock options, or perform modifications.
                </p>
              </div>
            )}

            {/* Action controllers */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
              {isAdmin && (
                <button
                  onClick={() => navigate("/admin-dashboard")}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 active:scale-98 transition shadow-sm text-center cursor-pointer flex items-center justify-center gap-2"
                  id="admin-dashboard-navigate-btn"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" stroke="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                  </svg>
                  Go to Operations & Analytics
                </button>
              )}
              <button
                onClick={() => navigate("/products")}
                className="w-full py-2.5 bg-black text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 active:scale-98 transition shadow-sm text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" /> Explore Active Shopping Catalogs
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Close Active Session
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Admin created products manager (Only visible if isAdmin) */}
          {isAdmin && (
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm flex flex-col min-h-[500px]" id="admin-inventory-manager-pnl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-gray-100 gap-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
                    Your Uploaded Digital Inventory
                    <span className="py-0.5 px-2.5 bg-gray-100 text-gray-700 text-xs font-mono font-bold rounded-full">
                      {products.length}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Catalog items with creator identity matching <strong>{user.email}</strong>.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={fetchAdminProducts}
                    disabled={loadingProducts}
                    className="p-2 border border-gray-200 hover:bg-gray-150 rounded-xl text-gray-600 hover:text-black transition cursor-pointer disabled:opacity-50"
                    title="Refresh your items"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingProducts ? "animate-spin" : ""}`} />
                  </button>
                  <Link
                    to="/add-product"
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Product
                  </Link>
                </div>
              </div>

              {/* Feed Logic */}
              <div className="flex-grow mt-6">
                {loadingProducts ? (
                  <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                    <p className="text-xs font-mono">Syncing database products...</p>
                  </div>
                ) : productError ? (
                  <div className="p-4 bg-red-50 border border-red-105 rounded-xl text-center">
                    <p className="text-xs text-red-650">{productError}</p>
                    <button 
                      onClick={fetchAdminProducts} 
                      className="mt-2 text-xs font-bold text-red-800 underline hover:text-black"
                    >
                      Try Again
                    </button>
                  </div>
                ) : products.length === 0 ? (
                  <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center p-6">
                    <div className="w-12 h-12 bg-gray-55/40 rounded-full flex items-center justify-center text-gray-400 mb-3">
                      <PackageOpen className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-gray-800">No self-uploaded items found</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm">
                      You haven't uploaded any products using this account signature yet. Products created under your email address will display here.
                    </p>
                    <Link
                      to="/add-product"
                      className="mt-4 inline-flex items-center px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Create Your First Item Now
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[550px] overflow-y-auto pr-1">
                    {products.map((p) => (
                      <div 
                        key={p._id || p.id} 
                        className="flex items-center gap-4 p-3 bg-white hover:bg-gray-50/50 rounded-xl border border-gray-100 transition shadow-2xs"
                        id={`admin-prod-${p._id || p.id}`}
                      >
                        {/* Image Thumbnail */}
                        <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                          <img 
                            src={p.image} 
                            alt={p.title} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Title and stats layout */}
                        <div className="flex-grow min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate" title={p.title}>
                            {p.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-serif font-semibold">
                              {p.category}
                            </span>
                            <span className="text-[11px] text-gray-500 font-mono">
                              Price: <strong>${p.price.toFixed(2)}</strong>
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-[11px] text-gray-500 font-mono">
                              Stock: <strong className={p.stock === 0 ? "text-red-500 font-bold" : "text-gray-700"}>{p.stock}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Action Operations elements group */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Link
                            to={`/edit-product/${p._id || p.id}`}
                            className="p-1.5 bg-gray-100 text-gray-600 hover:text-black hover:bg-gray-200 rounded-lg transition"
                            title="Edit Product details"
                            id={`edit-prod-link-${p._id || p.id}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(p._id || p.id)}
                            className="p-1.5 bg-red-50 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition"
                            title="Delete item from inventory"
                            id={`del-prod-btn-${p._id || p.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
