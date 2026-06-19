import React, { useState, useEffect } from "react";
import API from "../services/api";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  LayoutGrid,
  Cpu,
  Smartphone,
  Laptop,
  Shirt,
  Footprints,
  BookOpen,
  Watch,
  Home
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const CATEGORIES = [
  "All",
  "Electronics",
  "Mobiles",
  "Laptops",
  "Fashion",
  "Shoes",
  "Books",
  "Accessories",
  "Home Appliances",
];

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  All: LayoutGrid,
  Electronics: Cpu,
  Mobiles: Smartphone,
  Laptops: Laptop,
  Fashion: Shirt,
  Shoes: Footprints,
  Books: BookOpen,
  Accessories: Watch,
  "Home Appliances": Home,
};

export default function Products() {
  const { user, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products");
        setProducts(res.data);
      } catch (err: any) {
        console.error("Error fetching all products:", err);
        setError("Could not load products. Please verify Express server connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id: string) => {
    try {
      await API.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete product.");
    }
  };

  // Filter products by role (ensure admin sees only their own added products. If admin has an email, match exactly)
  const displayProducts = isAdmin
    ? products.filter((p) => p.createdBy && p.createdBy.toLowerCase().trim() === user?.email?.toLowerCase().trim())
    : products;

  // Compute filtered listings
  const filteredProducts = displayProducts.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCategory =
      selectedCategory === "All" ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchSearch && matchCategory;
  });

  const bestProducts = filteredProducts.slice(0, 3);
  const otherProducts = filteredProducts.slice(3);

  return (
    <div className="bg-bg-natural min-h-screen pt-3 pb-10 px-4 sm:px-6 lg:px-8 font-sans" id="products-list-page">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Clean Top Actions Bar */}
        {isAdmin && displayProducts.length > 0 && (
          <div className="flex flex-row justify-start pb-4 border-b border-sand/30">
            <Link
              to="/add-product"
              className="inline-flex items-center px-4 py-2.5 bg-olive text-white text-xs font-semibold rounded-full hover:bg-olive-hover transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Product
            </Link>
          </div>
        )}

        {/* Categories Section under the search bar */}
        {!loading && !error && displayProducts.length > 0 && (
          <div className="py-2.5 overflow-x-auto scrollbar-none scroll-smooth flex items-center gap-2 border-b border-sand/20" id="top-categories-section">
            <div className="flex items-center gap-2">
              {CATEGORIES.map((cat) => {
                const IconComponent = CATEGORY_ICONS[cat] || LayoutGrid;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150 whitespace-nowrap border ${
                      isSelected
                        ? "bg-olive text-white border-olive shadow-xs"
                        : "bg-white text-stone-600 hover:bg-sand/15 border-sand/45"
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-stone-400'}`} />
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Listings Stage Section */}
        {loading ? (
          <Loader size="lg" />
        ) : error ? (
          <div className="text-center py-16 text-sm text-red-500 font-mono bg-red-50 rounded-xl mt-4">
            {error}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-stone-200 rounded-[24px] shadow-2xs" id="admin-empty-catalog-cta">
            <div className="mx-auto w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center border border-stone-150 mb-4">
              <Plus className="w-5 h-5 text-stone-500 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-serif font-bold text-stone-800">Your Catalog is Empty</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-2 leading-relaxed font-sans px-4">
              To keep store operations highly secure, default system seeds are hidden for merchants. Click the button below to publish your first exclusive item.
            </p>
            <div className="mt-6">
              <Link
                to="/add-product"
                className="inline-flex items-center px-5 py-2.5 bg-olive text-white text-xs font-semibold rounded-full hover:bg-olive-hover transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Your First Product
              </Link>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-xs mt-4">
            <p className="text-gray-500 font-medium font-sans">No matching products found.</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, choosing a different category above, or writing a custom criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Best Products (First Line) */}
            {bestProducts.length > 0 && (
              <div className="space-y-4" id="best-sellers-section">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <h2 className="font-serif text-lg md:text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
                    <span className="text-amber-500">★</span> Our Best Products
                  </h2>
                  <span className="text-[10px] uppercase tracking-wider font-mono text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full font-bold">
                    Featured Choice
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                  {bestProducts.map((p) => (
                    <ProductCard
                      key={p._id || p.id}
                      product={p}
                      onDelete={handleDeleteProduct}
                      isLarge={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Products (Seen on scrolling down) */}
            {otherProducts.length > 0 && (
              <div className="space-y-5 pt-4" id="other-products-section">
                <div className="flex items-center justify-between border-b border-sand/40 pb-2.5">
                  <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-stone-500">
                    All Other Products
                  </h3>
                  <span className="text-xs text-stone-400 font-mono italic">
                    Scroll down for more collection
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                  {otherProducts.map((p) => (
                    <ProductCard
                      key={p._id || p.id}
                      product={p}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
