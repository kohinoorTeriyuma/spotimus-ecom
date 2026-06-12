import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, User as UserIcon, Menu, X, LogOut, PackagePlus } from "lucide-react";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const triggerLogoutConfirm = () => {
    closeMenu();
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    closeMenu();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100" id="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Brand Segment */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" onClick={closeMenu} className="text-3xl font-serif font-semibold tracking-tight text-ink flex items-center">
              AURA
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive("/") ? "text-black font-semibold" : "text-gray-500 hover:text-black"
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`text-sm font-medium transition-colors ${
                isActive("/products") ? "text-black font-semibold" : "text-gray-500 hover:text-black"
              }`}
            >
              Products
            </Link>
            {isAdmin && (
              <Link
                to="/admin-dashboard"
                className={`text-sm font-medium transition-colors text-emerald-600 hover:text-emerald-700 ${
                  isActive("/admin-dashboard") ? "font-semibold underline decoration-2 decoration-emerald-500 underline-offset-4" : ""
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* User & Cart session controls (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* View Cart link */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-650 hover:text-ink transition-colors"
              id="desktop-cart-link"
            >
              <ShoppingCart className="w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-olive text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="relative w-9 h-9 rounded-full bg-sand/50 hover:bg-sand flex items-center justify-center text-ink transition-all duration-200 border border-sand hover:scale-105"
                  title={`Profile: ${user.name}`}
                >
                  <UserIcon className="w-4.5 h-4.5 text-olive" />
                  {isAdmin && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
                    </span>
                  )}
                </Link>

                <button
                  onClick={triggerLogoutConfirm}
                  className="p-2 text-stone-500 hover:text-red-650 rounded-full hover:bg-sand/30 transition-colors"
                  title="Logout Session"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold px-4 py-2 text-stone-600 hover:text-ink transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-xs font-semibold px-5 py-2 bg-olive text-white rounded-full hover:bg-olive-hover transition-all shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile responsive hamburger control menu button */}
          <div className="flex items-center md:hidden gap-3">
            {/* Mobile Basket link */}
            <Link
              to="/cart"
              onClick={closeMenu}
              className="relative p-2 text-stone-605 hover:text-ink transition-colors"
            >
              <ShoppingCart className="w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-olive text-white text-[9px] font-bold h-4.5 w-4.5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={toggleMenu}
              type="button"
              className="p-2 rounded-md text-gray-600 hover:text-black focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu dropdown panel */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              onClick={closeMenu}
              className={`block px-3 py-2 text-base font-medium rounded-lg ${
                isActive("/") ? "bg-gray-100 text-black font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-black"
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={closeMenu}
              className={`block px-3 py-2 text-base font-medium rounded-lg ${
                isActive("/products") ? "bg-gray-100 text-black font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-black"
              }`}
            >
              Products
            </Link>
            {isAdmin && (
              <Link
                to="/admin-dashboard"
                onClick={closeMenu}
                className={`block px-3 py-2 text-base font-medium rounded-lg text-emerald-600 ${
                  isActive("/admin-dashboard") ? "bg-gray-100 font-semibold" : "hover:bg-gray-50 hover:text-black"
                }`}
              >
                Admin Dashboard
              </Link>
            )}



            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className={`block px-3 py-2 text-base font-medium rounded-lg ${
                    isActive("/profile") ? "bg-gray-100 text-black font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-black"
                  }`}
                >
                  Profile Details ({user.name})
                </Link>
                <button
                  onClick={triggerLogoutConfirm}
                  className="block w-full text-left px-3 py-2 text-base font-medium rounded-lg text-red-650 hover:bg-red-50"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-2 mt-4 pt-4 border-t border-sand">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="text-center text-sm font-semibold py-2.5 bg-sand/50 text-ink rounded-full active:scale-98"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="text-center text-sm font-semibold py-2.5 bg-olive text-white rounded-full active:scale-98 hover:bg-olive-hover"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Elegant Session Logout Confirmation Overlay */}
      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]"
          id="logout-confirmation-overlay"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div 
            className="bg-white rounded-3xl border border-gray-100 max-w-sm w-full p-6 shadow-2xl space-y-6 text-center transition-all duration-300 transform scale-100 animate-fade-in"
            id="logout-confirmation-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Icon Tray */}
            <div className="mx-auto w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center border border-red-150">
              <LogOut className="w-5 h-5" />
            </div>

            {/* Title & Narrative content */}
            <div className="space-y-2">
              <h3 className="text-lg font-serif font-bold text-gray-900" id="confirm-logout-title">
                Log Out of Aura?
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed font-sans px-2">
                You are about to terminate your active shopping and administration session. Any unsaved actions may require signing in again to resume.
              </p>
            </div>

            {/* Layout buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold rounded-2xl transition cursor-pointer active:scale-98"
                id="cancel-logout-btn"
              >
                Keep Session
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-2xl transition cursor-pointer active:scale-98 shadow-sm"
                id="do-logout-btn"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
