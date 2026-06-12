import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { ArrowLeft, Tag } from "lucide-react";

export default function CategoryProducts() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await API.get(`/products/category/${encodeURIComponent(categoryName || "")}`);
        setProducts(res.data);
      } catch (err: any) {
        console.error("Error fetching category products:", err);
        setError("Could not load products for this collection.");
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchCategoryProducts();
    }
  }, [categoryName]);

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
  };

  return (
    <div className="bg-bg-natural min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans" id="category-products-view-page">
      <div className="max-w-7xl mx-auto">
        {/* Navigation back and header metadata */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-ink mb-6 transition cursor-pointer"
          id="category-back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-8" id="category-header-title">
          <div className="p-2.5 bg-olive text-white rounded-full flex items-center justify-center">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold tracking-tight text-ink capitalize">
              {categoryName} Collection
            </h1>
            <p className="text-sm text-stone-550 font-sans">
              Only displaying products listed under the {categoryName} catalog tag.
            </p>
          </div>
        </div>

        {/* Listings stage */}
        {loading ? (
          <Loader size="lg" />
        ) : error ? (
          <div className="text-center py-12 text-sm text-red-500 font-mono bg-red-55 rounded-[20px] mt-6">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white border border-sand/40 rounded-[24px] shadow-xs">
            <p className="text-stone-700 font-medium font-serif text-lg">No products available in this category yet.</p>
            <p className="text-xs text-stone-450 mt-1 max-w-sm mx-auto font-sans">
              Be the first to add a landmark product inside the {categoryName} collection using your administrator panel!
            </p>
            <button
              onClick={() => navigate("/add-product")}
              className="mt-6 inline-flex items-center justify-center px-6 py-2.5 bg-olive text-white hover:bg-olive-hover text-xs font-semibold rounded-full transition cursor-pointer"
            >
              Add Product to {categoryName}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
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
