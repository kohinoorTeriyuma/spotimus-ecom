import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import { ArrowLeft, ShoppingBag, Plus, Minus, Tag, ShieldCheck, HelpCircle, Zap } from "lucide-react";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // States for recommendations
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [otherLoading, setOtherLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err: any) {
        console.error("Error fetching single product detail:", err);
        setError(err.response?.data?.message || "Product not found under this ID.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    const fetchOtherProducts = async () => {
      try {
        setOtherLoading(true);
        const res = await API.get("/products");
        // Filter out the currently selected detail product
        const filtered = res.data.filter((p: Product) => (p._id || p.id) !== id);
        setOtherProducts(filtered);
      } catch (err) {
        console.error("Error fetching alternative items:", err);
      } finally {
        setOtherLoading(false);
      }
    };

    if (id) {
      fetchOtherProducts();
    }
  }, [id]);

  const handleDeleteOtherProduct = async (productId: string) => {
    try {
      await API.delete(`/products/${productId}`);
      setOtherProducts((prev) => prev.filter((p) => (p._id || p.id) !== productId));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete product.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50/20">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center">
        <div className="p-8 bg-red-50 rounded-2xl border border-red-100 text-red-650">
          <HelpCircle className="w-12 h-12 mx-auto text-red-450 mb-3" />
          <h2 className="text-lg font-sans font-bold">Failed to find item</h2>
          <p className="text-xs font-mono mt-1">{error || "Unknown reference ID."}</p>
        </div>
        <button
          onClick={() => navigate("/products")}
          className="mt-6 inline-flex items-center text-sm font-semibold text-black hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to listings
        </button>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (!isOutOfStock) {
      addToCart(product, quantity);
      navigate("/cart");
    }
  };

  return (
    <div className="bg-bg-natural min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans" id="product-detail-view">
      <div className="max-w-6xl mx-auto">
        {/* Back Link shortcut */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-ink mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to listings
        </button>

        {/* Details card stage */}
        <div className="bg-white rounded-[24px] border border-sand/40 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
          {/* Main Product Image block */}
          <div className="relative aspect-square bg-sand/15 overflow-hidden rounded-[20px] border border-sand/30 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {isOutOfStock ? (
              <div className="absolute top-4 left-4 bg-taupe text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-full shadow-xs">
                Out of Stock
              </div>
            ) : product.stock <= 3 ? (
              <div className="absolute top-4 left-4 bg-amber-600 text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-full shadow-xs animate-pulse">
                Only {product.stock} items remaining
              </div>
            ) : null}
          </div>

          {/* Product details context block */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category tag label */}
              <Link
                to={`/category/${encodeURIComponent(product.category)}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-olive bg-sand px-3 py-1 rounded-full uppercase"
              >
                <Tag className="w-3 h-3" />
                {product.category}
              </Link>

              {/* Title heading */}
              <h1 className="mt-3 text-2xl sm:text-3xl font-sans font-bold text-stone-900 tracking-tight leading-tight">
                {product.title}
              </h1>

              {/* Price row */}
              <p className="mt-3 text-xl sm:text-2xl font-sans font-bold text-olive">
                ${product.price.toFixed(2)}
              </p>

              {/* Description body */}
              <div className="mt-6 pt-5 border-t border-sand/40">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Product Overview
                </h3>
                <p className="mt-2 text-sm text-stone-650 leading-relaxed font-sans">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Selection adjustments and purchase triggers */}
            <div className="mt-8 pt-6 border-t border-sand/40 space-y-5">
              {isAdmin ? (
                /* Administrative Insights & Management Panel */
                <div className="space-y-4" id="admin-product-details-ctrl">
                  <div className="flex items-center gap-2">
                    <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      Admin Viewport Active
                    </span>
                    <span className="text-xs text-stone-500 font-mono">
                      Stock Level: {product.stock} {product.stock === 1 ? "unit" : "units"} remaining
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => navigate(`/edit-product/${product._id || product.id}`)}
                      className="flex-grow py-3 px-6 bg-olive hover:bg-olive-hover text-white rounded-full text-sm font-semibold shadow-xs transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                      id="admin-edit-item-btn"
                    >
                      Edit Product Details
                    </button>
                    <button
                      onClick={() => navigate("/admin-dashboard")}
                      className="py-3 px-6 border border-sand/55 text-stone-650 hover:bg-sand/30 rounded-full text-sm font-semibold transition cursor-pointer"
                      id="admin-go-dashboard-btn"
                    >
                      Admin Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Costumer Purchase controls */
                <>
                  {!isOutOfStock && (
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                        Quantity
                      </span>
                      <div className="flex items-center border border-sand rounded-full bg-sand/15 overflow-hidden">
                        <button
                          type="button"
                          onClick={handleDecrement}
                          disabled={quantity <= 1}
                          className="p-2.5 hover:bg-sand/35 text-stone-600 disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-5 font-mono text-sm font-semibold select-none text-ink">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={handleIncrement}
                          disabled={quantity >= product.stock}
                          className="p-2.5 hover:bg-sand/35 text-stone-600 disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs text-stone-400 font-mono">
                        ({product.stock} available in stock)
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className={`flex-1 py-3 px-6 rounded-full flex items-center justify-center text-sm font-semibold shadow-xs transition-all focus:outline-none cursor-pointer ${
                        isOutOfStock
                          ? "bg-sand text-stone-400 cursor-not-allowed"
                          : added
                          ? "bg-emerald-650 hover:bg-emerald-700 text-white"
                          : "bg-white border border-olive text-olive hover:bg-sand/20 active:scale-98"
                      }`}
                      id="details-add-cart-btn"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      {isOutOfStock
                        ? "Sold Out"
                        : added
                        ? "Added!"
                        : `Add to Cart`}
                    </button>

                    {!isOutOfStock && (
                      <button
                        onClick={handleBuyNow}
                        className="flex-1 py-3 px-6 rounded-full bg-olive hover:bg-olive-hover text-white flex items-center justify-center text-sm font-semibold shadow-xs transition-all focus:outline-none cursor-pointer active:scale-98"
                        id="details-buy-now-btn"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Buy Now
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Safe assurances flags */}
              <div className="flex bg-sand/25 border border-sand/30 rounded-[16px] p-3 items-center text-xs text-stone-500 gap-2 font-sans">
                <ShieldCheck className="w-4 h-4 text-olive flex-shrink-0" />
                <span>Verified Secure Checkout System. Free standard tracking shipping included.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Other products recommendation area */}
        <div className="mt-16 border-t border-sand/35 pt-12 mb-10" id="other-listings-recommendations">
          <div className="flex flex-col mb-6">
            <h2 className="text-lg font-sans font-bold text-stone-900 tracking-tight">
              More Products to Explore
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Browse similar high-quality selections available in our store.
            </p>
          </div>

          {otherLoading ? (
            <div className="py-12 flex justify-center">
              <Loader size="md" />
            </div>
          ) : otherProducts.length === 0 ? (
            <p className="text-xs text-stone-400 italic">No alternative products available to display.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {otherProducts.map((p) => (
                <ProductCard
                  key={p._id || p.id}
                  product={p}
                  onDelete={handleDeleteOtherProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
