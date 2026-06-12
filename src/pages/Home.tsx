import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import API from "../services/api";
import { Product } from "../types";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { ChevronRight, ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";

const CATEGORIES = [
  "Electronics",
  "Mobiles",
  "Laptops",
  "Fashion",
  "Shoes",
  "Books",
  "Accessories",
  "Home Appliances",
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products");
        // Take the first 4 products as featured items
        setFeaturedProducts(res.data.slice(0, 4));
      } catch (err: any) {
        console.error("Failed to fetch featured products:", err);
        setError("Unable to load latest products. Please check server.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDeleteProduct = (id: string) => {
    // If deleted from a child, remove from the current local array
    setFeaturedProducts((prev) =>
      prev.filter((p) => (p._id || p.id) !== id)
    );
  };

  return (
    <div className="bg-bg-natural min-h-screen pb-16 flex flex-col font-sans" id="home-page-container">
      {/* Hero Section */}
      <section className="bg-white border-b border-sand/40 py-16 md:py-24" id="hero-banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block bg-sand text-olive px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
              New Arrival
            </span>
            <h1 className="mt-2 text-5xl sm:text-6xl font-serif font-semibold tracking-tight text-ink leading-tight">
              Ethical Living,<br className="hidden sm:inline" />
              Curated for You.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-stone-500 leading-relaxed">
              Discover our MVP collection of handcrafted home essentials for the modern minimalist. Test user registration, secure JWT validations, and file uploading instantly.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <RouterLink
                to="/products"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-olive text-white rounded-full text-sm font-semibold hover:bg-olive-hover transition-all shadow-xs group"
              >
                Explore Shop
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </RouterLink>
              <RouterLink
                to="/products"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-stone-800 border border-sand rounded-full text-sm font-semibold hover:bg-sand/20 transition-all"
              >
                Browse Collections
              </RouterLink>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Categories directory Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-20 w-full" id="categories-directory">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-serif font-semibold tracking-tight text-ink">
              Browse Categories
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Select a curation to view customized product selections.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat} name={cat} />
          ))}
        </div>
      </section>

      {/* Featured Products Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24 w-full" id="featured-showcase">
        <div className="flex justify-between items-end border-b border-sand/30 pb-5">
          <div>
            <h2 className="text-3xl font-serif font-semibold tracking-tight text-ink">
              Featured Products
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Our curated design staples, freshly added.
            </p>
          </div>
          <RouterLink
            to="/products"
            className="text-xs font-semibold text-olive hover:underline flex items-center gap-1"
          >
            All Products <ChevronRight className="w-3.5 h-3.5" />
          </RouterLink>
        </div>

        {loading ? (
          <Loader size="lg" />
        ) : error ? (
          <div className="text-center py-12 text-sm text-red-500 font-mono bg-red-50 rounded-xl mt-6">
            {error}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500 bg-white border border-gray-100 rounded-xl mt-6">
            No products available yet. Register or log in to add items.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* Features Assurances Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24 w-full" id="assurances-grid">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-8 md:p-10 rounded-[24px] border border-sand/40 shadow-xs">
          <div className="flex gap-4">
            <div className="p-3 bg-sand/30 min-h-12 w-12 rounded-full flex items-center justify-center text-olive">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-ink text-base">Swift Local Delivery</h4>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed font-sans">
                Experience mock shipping pipelines connecting real-world catalog elements.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="p-3 bg-sand/30 min-h-12 w-12 rounded-full flex items-center justify-center text-olive">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-ink text-base">Secure JWT Processing</h4>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed font-sans">
                Tokens are encoded server-side and kept secure in private localStorage.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="p-3 bg-sand/30 min-h-12 w-12 rounded-full flex items-center justify-center text-olive">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-ink text-base">Instant Reversibility</h4>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed font-sans">
                Delete or re-add catalog products instantly using easy cloud configurations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
