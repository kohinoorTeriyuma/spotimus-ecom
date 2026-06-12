import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Trash2, ShoppingBag, Plus, Minus, CreditCard, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function Cart() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  // Checkout modal simulator trigger
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      // Force logins before checkout
      navigate("/login", { state: { from: { pathname: "/cart" } } });
      return;
    }

    setCheckingOut(true);

    // Simulate safe processing delay
    setTimeout(() => {
      // Save order details to localStorage for Admin Dashboard stats
      try {
        const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`;
        const newOrder = {
          orderId,
          customerName: user.name,
          customerEmail: user.email,
          items: cartItems.map((item) => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          createdAt: new Date().toISOString(),
          totalAmount: cartTotal,
          status: "Processing",
        };

        const existingOrdersStr = localStorage.getItem("aura_completed_orders");
        const existingOrders = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
        existingOrders.unshift(newOrder);
        localStorage.setItem("aura_completed_orders", JSON.stringify(existingOrders));
      } catch (err) {
        console.error("Failed to store order simulation:", err);
      }

      setCheckingOut(false);
      setCheckoutComplete(true);
      clearCart();
    }, 1500);
  };

  // If checkout successfully processed
  if (checkoutComplete) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-sand/40 rounded-[24px] text-center shadow-xs animate-fade-in" id="checkout-success-banner">
        <div className="w-16 h-16 bg-sand/30 rounded-full flex items-center justify-center mx-auto text-olive mb-4 animate-scale-up">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-ink">Purchase Complete!</h2>
        <p className="mt-2 text-sm text-stone-500 leading-relaxed font-sans">
          Thank you for shopping with AURA. Your order has been placed successfully and has been sent to our dispatch catalog for processing. We have emailed you a confirmation receipt with shipping details.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="mt-6 w-full py-3 px-4 bg-olive text-white rounded-full text-sm font-semibold hover:bg-olive-hover transition active:scale-98 cursor-pointer"
        >
          Browse More Products
        </button>
      </div>
    );
  }

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-16 px-4 text-center py-16 bg-white border border-sand/30 rounded-[24px] shadow-xs" id="empty-cart-stage">
        <div className="w-12 h-12 bg-sand/30 rounded-full flex items-center justify-center mx-auto text-olive mb-4">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-serif font-semibold text-ink">Your Cart is Empty</h2>
        <p className="mt-2 text-sm text-stone-500 max-w-sm mx-auto font-sans leading-relaxed">
          Looks like you haven't added any products to your checkout list yet. Explore our bento-grid catalog.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center justify-center px-6 py-2.5 bg-olive text-white rounded-full text-xs font-semibold hover:bg-olive-hover transition shadow-xs cursor-pointer"
        >
          Find Products to Buy
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bg-natural min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans" id="shopping-cart-page">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-serif font-bold tracking-tight text-ink border-b border-sand/40 pb-5">
          Shopping Basket
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Listings details Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-full border border-sand/40 shadow-xs px-6">
              <span className="text-xs font-bold text-stone-500 uppercase">
                Product Details ({cartItems.length} items)
              </span>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-bold text-red-650 hover:text-red-750 flex items-center gap-1.5 transition cursor-pointer"
                id="clear-basket-btn"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All Items
              </button>
            </div>

            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-[24px] border border-sand/40 p-4 md:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                id={`cart-item-${item.productId}`}
              >
                {/* Image details context */}
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-sand/15 rounded-[16px] overflow-hidden border border-sand/20 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-ink text-base line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1 font-mono">
                      Single: ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Adjustment action trays */}
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 pt-3 sm:pt-0">
                  <div className="flex items-center border border-sand bg-sand/15 rounded-full overflow-hidden">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item.productId)}
                      className="p-1.5 hover:bg-sand/35 text-stone-605 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3.5 font-mono text-xs font-semibold select-none text-ink">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => increaseQuantity(item.productId)}
                      className="p-1.5 hover:bg-sand/35 text-stone-605 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-base font-serif font-bold text-ink w-24 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 hover:bg-red-50 text-red-650 rounded-full transition cursor-pointer"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <Link
              to="/products"
              className="inline-flex items-center text-sm font-semibold text-olive hover:underline mt-4 gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Continue shopping catalog
            </Link>
          </div>

          {/* Checkout billing summaries */}
          <div className="bg-white p-6 rounded-[24px] border border-sand/40 shadow-xs h-fit space-y-6">
            <h3 className="text-lg font-serif font-semibold text-ink pb-3 border-b border-sand/30">
              Billing Summary
            </h3>

            <div className="space-y-3 font-sans text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span className="font-serif text-ink font-semibold">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Delivery Charge</span>
                <span className="font-serif text-olive font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Tax Estimations</span>
                <span className="font-serif text-ink font-semibold">$0.00</span>
              </div>
              <div className="pt-3 border-t border-sand/30 flex justify-between text-base font-bold text-ink font-serif">
                <span>Final Total Price</span>
                <span className="text-lg">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Simulated Checkout Execution */}
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full flex items-center justify-center py-3 bg-olive text-white hover:bg-olive-hover font-semibold rounded-full text-sm transition-all shadow-xs active:scale-98 cursor-pointer disabled:bg-stone-300"
              id="checkout-checkout-btn"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {checkingOut ? "Processing payment..." : "Secure Checkout"}
            </button>

            {!user && (
              <p className="text-center text-[11px] text-stone-400 font-sans font-medium hover:underline">
                * Note: You will be redirected to Log In before finalizing.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
