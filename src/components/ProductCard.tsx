import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, Edit, Trash2, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onDelete?: (productId: string) => void;
  isLarge?: boolean;
  key?: any;
}

export default function ProductCard({ product, onDelete, isLarge = false }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();

  const productId = product._id || product.id || "";
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit-product/${productId}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete && window.confirm(`Are you sure you want to delete "${product.title}"?`)) {
      onDelete(productId);
    }
  };

  return (
    <div
      onClick={() => {
        if (isAdmin) {
          navigate(`/admin-dashboard?productId=${productId}`);
        } else {
          navigate(`/product/${productId}`);
        }
      }}
      className={`group bg-white rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full ${
        isLarge
          ? "border-2 border-stone-200 hover:border-olive/60 shadow-xs hover:shadow-md"
          : "border border-sand/40 hover:border-olive/35 hover:shadow-xs"
      }`}
      id={`product-card-${productId}`}
    >
      {/* Product Image Stage */}
      <div className={`relative bg-sand/15 overflow-hidden border-b border-sand/20 flex items-center justify-center ${
        isLarge ? "aspect-[4/3] sm:aspect-square" : "aspect-square"
      }`}>
        <img
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
        />

        {/* Stock Badges */}
        {isOutOfStock ? (
          <div className="absolute top-3 left-3 bg-taupe/90 text-white font-sans text-[8px] tracking-wider font-semibold uppercase px-2 py-0.5 rounded-md shadow-xs">
            Out of Stock
          </div>
        ) : product.stock <= 3 ? (
          <div className="absolute top-3 left-3 bg-amber-600 text-white font-sans text-[8px] tracking-wider font-semibold uppercase px-2 py-0.5 rounded-md shadow-xs animate-pulse">
            Only {product.stock} Left!
          </div>
        ) : isLarge ? (
          <div className="absolute top-3 left-3 bg-olive text-white font-sans text-[8px] tracking-wider font-semibold uppercase px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
            <Star className="w-2.5 h-2.5 fill-current" />
            <span>Best Seller</span>
          </div>
        ) : null}

      </div>

      {/* Product Details Block */}
      <div className={`flex flex-col flex-grow ${isLarge ? "p-4" : "p-3.5"}`}>
        {isLarge && (
          <div className="flex items-center gap-1 mb-1.5" id="product-rating">
            <div className="flex text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-[9px] text-stone-500 font-mono font-bold ml-1">
              4.9 (148 reviews)
            </span>
          </div>
        )}

        <h3 className={`font-semibold text-stone-900 group-hover:text-olive transition-colors leading-tight ${
          isLarge ? "text-sm sm:text-base font-serif" : "text-sm font-sans line-clamp-1"
        }`}>
          {product.title}
        </h3>
        <p className={`mt-1 text-stone-450 leading-relaxed flex-grow line-clamp-2 ${
          isLarge ? "text-[11px] sm:text-xs mt-1.5" : "text-[11px] line-clamp-1"
        }`}>
          {product.description}
        </p>

        {/* Action Tray */}
        <div className={`pt-2.5 border-t border-sand/30 flex items-center justify-between ${
          isLarge ? "mt-3" : "mt-2.5"
        }`}>
          <p className={`font-sans font-bold text-ink ${isLarge ? "text-sm sm:text-base" : "text-sm"}`}>
            ${product.price.toFixed(2)}
          </p>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Admin Management Controls */}
            {isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={handleEdit}
                  className={`hover:bg-sand text-stone-605 hover:text-ink rounded-lg transition-colors border border-sand ${
                    isLarge ? "p-2" : "p-1.5"
                  }`}
                  title="Edit Product"
                  id={`edit-btn-${productId}`}
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className={`hover:bg-red-50 text-red-650 rounded-lg transition-colors border border-red-100 ${
                    isLarge ? "p-2" : "p-1.5"
                  }`}
                  title="Delete Product"
                  id={`delete-btn-${productId}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              /* Standard Cart Adding Button - Only for Non-Admins */
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex items-center justify-center transition-all ${
                  isLarge 
                    ? "px-4 py-2 bg-olive text-white hover:bg-olive-hover rounded-full text-xs font-semibold shadow-xs active:scale-95 gap-1.5" 
                    : "p-2 rounded-full"
                } ${
                  isOutOfStock
                    ? "bg-sand text-stone-400 cursor-not-allowed"
                    : "bg-olive text-white hover:bg-olive-hover shadow-xs active:scale-95"
                }`}
                id={`add-cart-${productId}`}
                title={isOutOfStock ? "Cannot add - Out of Stock" : "Add to Cart"}
              >
                <ShoppingBag className="w-3.5 h-3.5 animate-none" />
                {isLarge && <span>Add</span>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
