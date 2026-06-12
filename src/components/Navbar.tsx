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

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
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

            {/* Admin actions shortcut */}
            {isAdmin && (
              <Link
                to="/add-product"
                className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  isActive("/add-product") ? "text-black font-semibold" : "text-gray-500 hover:text-black"
                }`}
                title="Add New Catalog Product"
              >
                <PackagePlus className="w-4 h-4 text-emerald-500" />
                Add Product
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
                  className="flex items-center space-x-1 py-1.5 px-3.5 bg-sand/50 hover:bg-sand rounded-full text-xs font-medium text-ink transition"
                >
                  <UserIcon className="w-3.5 h-3.5 mr-1 text-olive" />
                  <span>{user.name}</span>
                  {isAdmin && (
                    <span className="ml-1.5 bg-olive/15 text-olive text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                      ADMIN
                    </span>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
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
                to="/add-product"
                onClick={closeMenu}
                className={`block px-3 py-2 text-base font-medium rounded-lg text-emerald-600 hover:bg-emerald-50 ${
                  isActive("/add-product") ? "bg-emerald-50 font-semibold" : ""
                }`}
              >
                + Add Product
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
                  onClick={handleLogout}
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
    </nav>
  );
}
