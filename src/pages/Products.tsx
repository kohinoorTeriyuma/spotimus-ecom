import React, { useState, useEffect } from "react";
import API from "../services/api";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import { Link } from "react-router-dom";

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

export default function Products() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
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

  // Compute filtered listings
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCategory =
      selectedCategory === "All" ||
      p.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchSearch && matchCategory;
  });

  return (
    <div className="bg-bg-natural min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans" id="products-list-page">
      <div className="max-w-7xl mx-auto">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-sand/45 pb-6">
          <div>
            <h1 className="text-4xl font-serif font-semibold tracking-tight text-ink">
              Our Active Catalog
            </h1>
            <p className="mt-1 text-sm text-stone-500 font-sans">
              Browse our entire inventory or refine by collections and search tags.
            </p>
          </div>

          {isAdmin && (
            <Link
              to="/add-product"
              className="inline-flex items-center px-5 py-2.5 bg-olive text-white text-xs font-semibold rounded-full hover:bg-olive-hover transition shadow-xs self-start md:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Product
            </Link>
          )}
        </div>

        {/* Search & Categories Bar block */}
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title, keywords..."
                className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-sand/40 rounded-full focus:border-olive focus:ring-1 focus:ring-olive outline-hidden transition"
              />
            </div>

            {/* Hint Indicator */}
            <span className="text-xs text-stone-400 font-mono hidden lg:inline flex-shrink-0">
              Showing {filteredProducts.length} of {products.length} items
            </span>
          </div>

          {/* Horizontal scrollable category pill select list */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400 mr-1.5 flex-shrink-0" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition ${
                  selectedCategory === cat
                    ? "bg-olive text-white shadow-xs"
                    : "bg-white text-stone-605 hover:bg-sand/30 border border-sand/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Stage Grid */}
        {loading ? (
          <Loader size="lg" />
        ) : error ? (
          <div className="text-center py-16 text-sm text-red-500 font-mono bg-red-50 rounded-xl mt-6">
            {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-xs mt-6">
            <p className="text-gray-500 font-medium font-sans">No matching products found.</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Try readjusting your search criteria, checking alternative filter pills, or adding fresh products to the store database as an administrator.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p._id || p.id}
                product={p}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
