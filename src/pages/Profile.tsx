import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, LogOut, ShieldAlert, BadgeCheck, Clock, Mail } from "lucide-react";

export default function Profile() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return null; // Safety redirect handled by ProtectedRoute
  }

  return (
    <div className="bg-gray-50/50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans" id="profile-page-view">
      <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
        {/* Header avatar representation */}
        <div className="flex flex-col items-center border-b border-gray-100 pb-6">
          <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center font-sans text-3xl font-extrabold shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-4 text-xl font-sans font-bold text-gray-950">{user.name}</h2>
          <span className="text-xs text-gray-400 font-mono mt-0.5">Joined on {new Date(user.createdAt).toLocaleDateString()}</span>

          {isAdmin ? (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase rounded-full">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> Admin Account Enabled
            </div>
          ) : (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-mono font-bold uppercase rounded-full">
              Standard Client Profile
            </div>
          )}
        </div>

        {/* Informative credentials lists */}
        <div className="mt-6 space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Connected Session Details
          </h3>

          <div className="space-y-3.5">
            {/* Registered email */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-55/40">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold font-mono">Email Address</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{user.email}</p>
              </div>
            </div>

            {/* Profile database ID */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-55/40">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold font-mono">Profile Database Index ID</p>
                <p className="text-sm font-mono text-gray-650 mt-0.5 break-all">{user.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testing instructions block */}
        {isAdmin && (
          <div className="mt-6 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
            <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 font-sans">
              <ShieldAlert className="w-4 h-4 text-emerald-600" /> Administrator Privilege Active
            </h4>
            <p className="text-xs text-gray-600 font-sans mt-1 leading-relaxed">
              As an admin user, you are cleared to add new items, rewrite description blocks, restock supplies, or remove unwanted items directly from the catalog.
            </p>
          </div>
        )}

        {/* Action controllers */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
          <button
            onClick={() => navigate("/products")}
            className="w-full py-2.5 bg-black text-white rounded-xl text-xs font-semibold hover:bg-charcoal active:scale-98 transition shadow-sm text-center cursor-pointer"
          >
            Explore Interactive Shopping Catalogs
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 border border-red-250 text-red-650 rounded-xl text-xs font-semibold hover:bg-red-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Close Active Session
          </button>
        </div>
      </div>
    </div>
  );
}
