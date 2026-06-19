import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Briefcase, 
  ArrowRight, 
  Sparkles, 
  CheckCircle, 
  X, 
  Loader2, 
  ShieldCheck,
  UserCheck
} from "lucide-react";

export default function Footer() {
  const { user, isAdmin, promoteToAdmin, register } = useAuth();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [customReg, setCustomReg] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Custom registration inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handlePartnerClick = () => {
    setIsModalOpen(true);
    setSuccess(false);
    setErrorMsg("");
    setCustomReg(false);
    setName("");
    setEmail("");
    setPassword("");
  };

  const handlePromoteExisting = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      await promoteToAdmin();
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        navigate("/admin-dashboard");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not update your account to merchant status.");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg("Please fill in all credentials.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await register(name, email, password);
      await promoteToAdmin();
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        navigate("/admin-dashboard");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to register merchant credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-white border-t border-sand/45 relative" id="app-footer">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 font-sans">
          {/* Logo & Slogan */}
          <div className="md:col-span-2">
            <Link to="/" className="text-2xl font-serif font-semibold tracking-tight text-ink">
              AURA
            </Link>
            <p className="mt-4 text-sm text-stone-500 max-w-sm leading-relaxed">
              Curated minimal design, lifestyle essentials, and premium accessories. Intention in every detail, crafted for the ultimate comfort of modern everyday living.
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
                <Link to="/category/Mobiles" className="text-sm text-stone-600 hover:text-ink transition-colors font-sans">
                  Mobiles
                </Link>
              </li>
              <li>
                <Link to="/category/Laptops" className="text-sm text-stone-600 hover:text-ink transition-colors font-sans">
                  Laptops
                </Link>
              </li>
              <li>
                <Link to="/category/Fashion" className="text-sm text-stone-600 hover:text-ink transition-colors font-sans">
                  Fashion
                </Link>
              </li>
            </ul>
          </div>

          {/* Become a Partner Section */}
          <div>
            <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-stone-400">
              Merchant Network
            </h4>
            <div className="mt-4 space-y-3">
              <button
                onClick={handlePartnerClick}
                className="w-full inline-flex items-center justify-between text-left text-sm font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200/80 px-4 py-3 rounded-xl transition-all group cursor-pointer active:scale-98 shadow-2xs"
                id="footer-partner-btn"
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-olive animate-none" />
                  <span>Partner with us</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-olive group-hover:translate-x-0.5 transition-all" />
              </button>
              <p className="text-[11px] text-stone-400 leading-normal">
                Want to list beautiful curations and view granular multi-product customer checkout velocity? Gain Seller access in seconds.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-sand/40 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Aura Curation. Designed for Minimal Living.</p>
          <div id="footer-branding" className="mt-4 sm:mt-0 font-sans text-[10px] font-semibold tracking-widest text-olive uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-505 bg-emerald-500 inline-block animate-pulse"></span>
            <span>Secure Enterprise Curation Engine</span>
          </div>
        </div>
      </div>

      {/* SELLER ELEVATION MODAL CONTROLS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="seller-upgrade-overlay">
          <div className="bg-white rounded-[24px] border border-stone-200 shadow-2xl w-full max-w-md overflow-hidden relative animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-olive/15 text-olive flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-sm">Join Aura Merchant Network</h3>
                  <p className="text-[10px] text-stone-504 text-stone-500 font-sans">Upgrade to a Partner workspace instantly</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 px-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-850 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {success ? (
                <div className="text-center py-8 space-y-3 animate-fade-in" id="promotion-success">
                  <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-200 animate-bounce">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 font-sans">Merchant Privileges Installed!</h4>
                  <p className="text-xs text-stone-500 font-sans leading-relaxed max-w-xs mx-auto">
                    Welcome to the network. Your account is now fully elevated to Admin. Routing to your control panel...
                  </p>
                </div>
              ) : (
                <>
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-650 text-xs rounded-xl font-mono text-center">
                      {errorMsg}
                    </div>
                  )}

                  {user ? (
                    // Logic for already logged in user: Just one simple button!
                    <div className="space-y-4 py-2 text-center" id="promotion-logged-in">
                      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-800">
                          Account Authenticated as <span className="underline font-mono">{user.email}</span>
                        </p>
                        <p className="text-[11px] text-stone-500 max-w-xs mx-auto mt-1 leading-relaxed">
                          Click below to instantly attach Merchant / Admin privileges to this user. You will gain instant layout editors and performance metrics tracking.
                        </p>
                      </div>

                      <button
                        onClick={handlePromoteExisting}
                        disabled={loading}
                        className="w-full inline-flex items-center justify-center py-2.5 bg-olive text-white hover:bg-olive-hover font-semibold text-xs rounded-full shadow-md active:scale-98 transition disabled:bg-stone-300 cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                            <span>Upgrading Profile...</span>
                          </>
                        ) : (
                          <span>Promote Account to Admin Now</span>
                        )}
                      </button>
                    </div>
                  ) : (
                    // Logic for guest users (not logged in)
                    <div className="space-y-4">
                      {!customReg ? (
                        <div className="space-y-4.5 py-1 text-center" id="promotion-guest-options">
                          <p className="text-xs text-stone-605 max-w-sm mx-auto leading-relaxed">
                            You are currently a guest user. Get started with Aura Merchant Network:
                          </p>

                          <div className="space-y-3 pt-1">
                            {/* ONLY PREMIUM MERCHANT ACCOUNT */}
                            <button
                              onClick={() => {
                                setCustomReg(true);
                                setErrorMsg("");
                              }}
                              className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-stone-50 border border-stone-150 rounded-2xl cursor-pointer text-left transition-all"
                            >
                              <div className="space-y-0.5">
                                <span className="font-sans font-semibold text-xs text-stone-850">
                                  Create Premium Merchant Account
                                </span>
                                <span className="text-[10px] text-stone-400 block font-normal">
                                  Register using your personal email name & brand
                                </span>
                              </div>
                              <ArrowRight className="w-4 h-4 text-stone-400" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Custom Registration Form
                        <form onSubmit={handleCustomRegister} className="space-y-3.5 pt-1" id="promotion-custom-form">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase font-bold text-stone-500">Brand Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Zen Design Lab"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full text-xs px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-olive focus:border-olive"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase font-bold text-stone-500">Business Email</label>
                            <input
                              type="email"
                              required
                              placeholder="e.g. curator@design.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full text-xs px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-olive focus:border-olive"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase font-bold text-stone-500">Password</label>
                            <input
                              type="password"
                              required
                              placeholder="Min 6 characters"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full text-xs px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-olive focus:border-olive"
                            />
                          </div>

                          <div className="flex gap-2 pt-2.5">
                            <button
                              type="submit"
                              disabled={loading}
                              className="w-full py-2.5 bg-olive text-white hover:bg-olive-hover text-xs font-semibold rounded-full active:scale-98 transition disabled:bg-stone-300 flex items-center justify-center gap-1 cursor-pointer"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <span>Register as Admin</span>
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Modal Footer Decor */}
            <div className="bg-stone-50 border-t border-stone-100 px-6 py-4 flex justify-between items-center text-[10px] text-stone-450">
              <span className="flex items-center gap-1 font-mono uppercase tracking-widest font-bold text-[9px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Dual Sandbox Environment
              </span>
              <span>Fully Persistent</span>
            </div>

          </div>
        </div>
      )}
    </footer>
  );
}
