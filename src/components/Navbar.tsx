import React, { useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, User as UserIcon, Menu, X, Search } from "lucide-react";

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  React.useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (location.pathname === "/" || location.pathname === "/products") {
      if (val) {
        setSearchParams({ search: val });
      } else {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("search");
        setSearchParams(nextParams);
      }
    } else {
      navigate(`/products?search=${encodeURIComponent(val)}`);
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100" id="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Brand Segment with search */}
          <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
            <Link to="/" onClick={closeMenu} className="text-3xl font-serif font-semibold tracking-tight text-ink flex items-center">
              AURA
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  className="block md:w-60 lg:w-80 xl:w-[400px] pl-10 pr-4 py-2 text-sm bg-stone-50 hover:bg-stone-100/70 border border-stone-300 rounded-full focus:bg-white focus:border-stone-500 focus:ring-1 focus:ring-stone-500 outline-hidden shadow-xs transition duration-150 font-sans text-stone-900 placeholder-stone-400"
                />
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {isAdmin && (
              <>
                <Link
                  to="/admin-dashboard"
                  className={`text-sm font-medium transition-colors text-emerald-600 hover:text-emerald-700 ${
                    isActive("/admin-dashboard") ? "font-semibold underline decoration-2 decoration-emerald-500 underline-offset-4" : ""
                  }`}
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* User & Cart session controls (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* View Cart link - Only for non-admins */}
            {!isAdmin && (
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
            )}

            {user && (
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
              </div>
            )}
          </div>

          {/* Mobile responsive hamburger control menu button */}
          <div className="flex items-center md:hidden gap-3">
            {/* Mobile Basket link */}
            {!isAdmin && (
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
            )}

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
            {/* Mobile Search input inside menu */}
            <div className="px-3 pb-3 pt-1 border-b border-gray-100/50 mb-1">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-full focus:bg-white focus:border-stone-500 outline-hidden shadow-xs transition font-sans text-stone-900 placeholder-stone-400"
                />
              </div>
            </div>

            {isAdmin && (
              <>
                <Link
                  to="/admin-dashboard"
                  onClick={closeMenu}
                  className={`block px-3 py-2 text-base font-medium rounded-lg text-emerald-600 ${
                    isActive("/admin-dashboard") ? "bg-gray-100 font-semibold" : "hover:bg-gray-50 hover:text-black"
                  }`}
                >
                  Admin Dashboard
                </Link>
              </>
            )}

            {user && (
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
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
