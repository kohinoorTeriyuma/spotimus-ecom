import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, Edit, Trash2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onDelete?: (productId: string) => void;
  key?: any;
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
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
      onClick={() => navigate(`/product/${productId}`)}
      className="group bg-white rounded-[24px] border border-sand/40 hover:border-olive/30 hover:shadow-xs transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
      id={`product-card-${productId}`}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square bg-sand/20 overflow-hidden border-b border-sand/20 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
        />

        {/* Stock Badges */}
        {isOutOfStock ? (
          <div className="absolute top-3 left-3 bg-taupe/90 text-white font-sans text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full shadow-xs">
            Out of Stock
          </div>
        ) : product.stock <= 3 ? (
          <div className="absolute top-3 left-3 bg-amber-600 text-white font-sans text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full shadow-xs animate-pulse">
            Only {product.stock} Left!
          </div>
        ) : null}

        {/* Category Label */}
        <span className="absolute bottom-3 left-3 bg-sand text-olive font-sans text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-sand/20">
          {product.category}
        </span>
      </div>

      {/* Product Details Block */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-serif font-bold text-ink text-base line-clamp-1 leading-snug group-hover:text-olive transition-colors">
          {product.title}
        </h3>
        <p className="mt-1.5 text-xs text-stone-500 line-clamp-2 leading-relaxed flex-grow">
          {product.description}
        </p>

        {/* Action Tray */}
        <div className="mt-4 pt-4 border-t border-sand/40 flex items-center justify-between">
          <p className="text-base font-serif font-bold text-ink">
            ${product.price.toFixed(2)}
          </p>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Admin Management Controls */}
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={handleEdit}
                  className="p-1.5 hover:bg-sand/35 text-stone-600 hover:text-ink rounded-full transition-colors border border-transparent"
                  title="Edit Product"
                  id={`edit-btn-${productId}`}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1.5 hover:bg-red-50 text-red-650 rounded-full transition-colors border border-transparent"
                  title="Delete Product"
                  id={`delete-btn-${productId}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Standard Cart Adding Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
                isOutOfStock
                  ? "bg-sand text-stone-400 cursor-not-allowed"
                  : "bg-olive text-white hover:bg-olive-hover shadow-xs active:scale-95"
              }`}
              id={`add-cart-${productId}`}
              title={isOutOfStock ? "Cannot add - Out of Stock" : "Add to Cart"}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
