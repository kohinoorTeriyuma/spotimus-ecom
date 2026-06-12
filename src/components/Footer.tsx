import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-sand/45" id="app-footer">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 font-sans">
          {/* Logo & Slogan */}
          <div className="md:col-span-2">
            <Link to="/" className="text-2xl font-serif font-semibold tracking-tight text-ink">
              AURA
            </Link>
            <p className="mt-4 text-sm text-stone-500 max-w-sm leading-relaxed">
              Curated minimal design essentials running as a high-fidelity catalog. Test user registration, secure JWT sessions, and file uploads instantly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-stone-400">
              Shop Collections
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/category/Electronics" className="text-sm text-stone-600 hover:text-ink transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/category/Mobiles" className="text-sm text-stone-600 hover:text-ink transition-colors">
                  Mobiles
                </Link>
              </li>
              <li>
                <Link to="/category/Laptops" className="text-sm text-stone-600 hover:text-ink transition-colors">
                  Laptops
                </Link>
              </li>
              <li>
                <Link to="/category/Fashion" className="text-sm text-stone-600 hover:text-ink transition-colors">
                  Fashion
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Tech Stack */}
          <div>
            <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-stone-400">
              Curation Standard
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-stone-500">
              <li>React + Context API</li>
              <li>Node.js + Express</li>
              <li>JWT Auth</li>
              <li>Natural Tones Aesthetic</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-sand/40 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Aura Curation. Designed for Minimal Living.</p>
          <div id="footer-branding" className="mt-4 sm:mt-0 font-sans text-[10px] font-semibold tracking-widest text-olive uppercase">
            Secure Payments &bull; Terms
          </div>
        </div>
      </div>
    </footer>
  );
}
