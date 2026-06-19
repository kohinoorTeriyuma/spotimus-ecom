import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import API from "../services/api";
import { Product } from "../types";
import { useOrderStore, Order } from "../store/useOrderStore";
import {
  BarChart3,
  TrendingUp,
  Package,
  AlertTriangle,
  Receipt,
  RotateCw,
  Search,
  ShoppingCart,
  ChevronRight,
  Filter,
  DollarSign,
  Briefcase,
  Layers,
  ArrowLeft,
  Trash2,
  Settings,
  Plus
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // States
  const [products, setProducts] = useState<Product[]>([]);
  const orders = useOrderStore((state) => state.orders);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
  const deleteOrderAction = useOrderStore((state) => state.deleteOrder);
  const clearAllOrdersAction = useOrderStore((state) => state.clearAllOrders);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Fetch operations
  const fetchDashboardData = async (isRef = false) => {
    if (isRef) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Get products from database
      const prodRes = await API.get("/products");
      setProducts(prodRes.data || []);
    } catch (err) {
      console.error("Dashboard loaded error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchDashboardData();
  }, [isAdmin, navigate]);

  // Smooth scroll to single product analytics if productId is present in URL query
  useEffect(() => {
    const urlProductId = searchParams.get("productId");
    if (urlProductId) {
      setTimeout(() => {
        const element = document.getElementById("single-product-analytics-panel");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 350);
    }
  }, [searchParams]);

  // Handle Order Deletion
  const deleteOrder = (orderId: string) => {
    if (!window.confirm(`Are you sure you want to dismiss or remove order #${orderId}?`)) {
      return;
    }
    deleteOrderAction(orderId);
  };

  const clearAllOrders = () => {
    if (!window.confirm("Danger: Proceeding will reset the orders database. Ready?")) {
      return;
    }
    clearAllOrdersAction();
  };

  // Calculations
  // Only show products which the currently logged-in admin created
  const adminProducts = products.filter(
    (p) => p.createdBy && p.createdBy.toLowerCase().trim() === user?.email?.toLowerCase().trim()
  );

  // Track customer checkouts and calculate transaction details over the product list
  const realOrders = orders
    .map((o) => {
      const adminItems = o.items.filter((item) =>
        adminProducts.some((ap) => (ap._id || ap.id) === item.productId)
      );
      const totalAmount = adminItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return {
        ...o,
        items: adminItems,
        totalAmount,
      };
    })
    .filter((o) => o.items.length > 0);

  const totalRevenue = realOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const completedOrdersCount = realOrders.length;
  const averageOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;
  
  // Units remaining
  const totalStockUnits = adminProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
  
  // Inventory value (price * stock)
  const totalInventoryValue = adminProducts.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);

  // Number of low stock products (less than 5 stock)
  const lowStockCount = adminProducts.filter((p) => p.stock !== undefined && p.stock < 5).length;

  // Compute Units Sold per product dynamically based on orders
  const productSalesMap: Record<string, number> = {};
  realOrders.forEach((o) => {
    o.items.forEach((item) => {
      productSalesMap[item.productId] = (productSalesMap[item.productId] || 0) + item.quantity;
    });
  });

  // Calculate high selling category counts
  const categorySalesMap: Record<string, number> = {};
  const categoryCountMap: Record<string, number> = {};
  
  adminProducts.forEach((p) => {
    categoryCountMap[p.category] = (categoryCountMap[p.category] || 0) + 1;
  });

  realOrders.forEach((o) => {
    o.items.forEach((item) => {
      // Find the category of the item
      const linkedProduct = adminProducts.find((p) => (p._id || p.id) === item.productId);
      const cat = linkedProduct ? linkedProduct.category : "Design Essentials";
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + (item.price * item.quantity);
    });
  });

  // Sort categories by sales revenue
  const topCategories = Object.entries(categorySalesMap)
    .map(([category, revenue]) => ({ category, revenue, count: categoryCountMap[category] || 0 }))
    .sort((a, b) => b.revenue - a.revenue);

  // Filter orders
  const filteredOrders = realOrders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-gray-50/50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans" id="admin-dashboard-frame">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner with controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200/60 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-stone-550 mb-4">
              <Link to="/profile" className="text-xs hover:underline flex items-center gap-1 font-semibold text-olive/90">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
              </Link>
            </div>
            <h1 className="text-3xl font-serif font-semibold tracking-tight text-ink flex items-center gap-2.5">
              <BarChart3 className="w-7 h-7 text-olive" />
              Operations & Analytics
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">
              Live executive summary of active store products, sales volumes, stock value, and recent payments.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <Link
              to="/products"
              className="px-4 py-2 bg-black hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Package className="w-3.5 h-3.5" />
              Manage Catalogue
            </Link>
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing || loading}
              className="p-2 bg-white hover:bg-gray-100/80 border border-gray-200 text-stone-650 rounded-xl flex items-center justify-center transition cursor-pointer disabled:opacity-50"
              title="Sync Live Status"
            >
              <RotateCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* LOADING SHIMMER */}
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <RotateCw className="w-10 h-10 animate-spin text-olive" />
            <p className="text-sm font-semibold text-stone-500">Retrieving secure merchant database analytics...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW STATS GRID (BENTO SYSTEM) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="admin-stats-bento">
              
              {/* REVENUE */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-mono uppercase font-bold text-gray-400 tracking-wider">Gross Sales Revenue</p>
                  <p className="text-2xl font-serif font-extrabold text-gray-900 mt-1">${totalRevenue.toFixed(2)}</p>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-mono">
                    <TrendingUp className="w-3 h-3" />
                    <span>Live Tracking</span>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-full -mr-8 -mt-8" />
              </div>

              {/* ORDERS COMPLETED */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden flex items-center gap-4">
                <div className="w-12 h-12 bg-olive/15 text-olive rounded-xl flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-mono uppercase font-bold text-gray-400 tracking-wider">Payments Processed</p>
                  <p className="text-2xl font-serif font-extrabold text-gray-900 mt-1">{completedOrdersCount}</p>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500 font-mono">
                    <ShoppingCart className="w-3 h-3 text-stone-400" />
                    <span>Avg Order Value: ${averageOrderValue.toFixed(2)}</span>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-olive/10 to-transparent rounded-full -mr-8 -mt-8" />
              </div>

              {/* TOTAL PRODUCTS & STOCK VALUE */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Package className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-xs font-mono uppercase font-bold text-gray-400 tracking-wider">Total Inventory Stock</p>
                  <p className="text-2xl font-serif font-extrabold text-gray-900 mt-1">{totalStockUnits} units</p>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500 font-mono">
                    <Layers className="w-3 h-3 text-stone-400" />
                    <span>Valued at: ${totalInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/5 to-transparent rounded-full -mr-8 -mt-8" />
              </div>

              {/* LOW STOCK ALERTS */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative overflow-hidden flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${lowStockCount > 0 ? "bg-red-50 text-red-650" : "bg-blue-50 text-blue-600"}`}>
                  <AlertTriangle className="w-5.5 h-5.5" />
                </div>
                <div>
                  <p className="text-xs font-mono uppercase font-bold text-gray-400 tracking-wider">Stock Alert Threshold</p>
                  <p className="text-2xl font-serif font-extrabold text-gray-900 mt-1">{lowStockCount} items</p>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-sans">
                    <span className={lowStockCount > 0 ? "text-red-500 font-semibold" : "text-emerald-600 font-semibold"}>
                      {lowStockCount > 0 ? "Re-order items suggested" : "All catalog items stocked"}
                    </span>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-red-500/5 to-transparent rounded-full -mr-8 -mt-8" />
              </div>

            </div>

            {/* VISUAL CHARTS BAR & CATEGORIES BREAKDOWN SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* CATEGORY REVENUE GRAPH */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-serif font-bold text-gray-900 flex items-center gap-1.5 text-base">
                      <Layers className="w-4.5 h-4.5 text-olive" />
                      Sales Distribution on Categories
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Calculated by product checkout values in each vertical.</p>
                  </div>
                </div>

                <div className="flex-grow mt-6 space-y-4">
                  {topCategories.length === 0 ? (
                    <div className="py-12 text-center text-xs text-gray-400">
                      No categories with sales registered. Check out a few products to view graph.
                    </div>
                  ) : (
                    <div className="space-y-4.5">
                      {topCategories.map(({ category, revenue, count }) => {
                        const totalCatRevenue = topCategories.reduce((s, x) => s + x.revenue, 0);
                        const percentage = totalCatRevenue > 0 ? (revenue / totalCatRevenue) * 100 : 0;

                        return (
                          <div key={category} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-medium">
                              <span className="text-gray-800 font-serif font-bold flex items-center gap-1.5">
                                {category}
                                <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-mono">
                                  {count} catalog items
                                </span>
                              </span>
                              <span className="font-mono text-gray-900">
                                ${revenue.toFixed(2)} (<strong className="text-olive">{percentage.toFixed(0)}%</strong>)
                              </span>
                            </div>
                            
                            {/* SVG / Custom visual bar progress status indicator */}
                            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-olive h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(percentage, 3)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* QUICK INVENTORY INSIGHTS / VELOCITY */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <div className="pb-4 border-b border-gray-100">
                  <h3 className="font-serif font-bold text-gray-900 flex items-center gap-1.5 text-base">
                    <TrendingUp className="w-4.5 h-4.5 text-olive" />
                    Bestseller Velocity
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Top products currently moving out of inventory.</p>
                </div>

                <div className="flex-grow mt-5 space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {adminProducts.length === 0 ? (
                    <div className="py-10 text-center text-xs text-gray-400">No active products to trace.</div>
                  ) : (
                    adminProducts
                      .map((p) => ({
                        ...p,
                        sold: productSalesMap[p._id || p.id] || 0,
                      }))
                      .sort((a, b) => b.sold - a.sold)
                      .slice(0, 5)
                      .map((p) => (
                        <div key={p._id || p.id} className="flex items-center justify-between p-2 rounded-xl bg-gray-50/50 hover:bg-gray-100 transition">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-gray-900 truncate" title={p.title}>
                                {p.title}
                              </h4>
                              <p className="text-[10px] text-gray-400 truncate">{p.category}</p>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0 pl-1">
                            <span className="text-xs font-mono font-bold bg-olive/10 text-olive px-2.5 py-1 rounded-full">
                              {p.sold} Sold
                            </span>
                            <p className="text-[9px] text-gray-400 mt-1 font-mono">Stock Left: {p.stock}</p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

            </div>

            {/* TRANSACTIONS SECTION: ORDERS LOGS & ACTIONS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm" id="admin-orders-log-panel">
              {/* Header controller block */}
              <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-olive" />
                    Live Payments & Dispatches
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Orders successfully checked out by active clients. Modify statuses or dismiss records as shipping progresses.
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Search field */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search ID, customer email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-olive focus:border-olive outline-none w-52"
                    />
                  </div>

                  {/* Filter selector */}
                  <div className="flex items-center border border-gray-200 rounded-xl px-2.5 py-1.5 bg-white text-xs text-gray-600 gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent focus:outline-none font-medium cursor-pointer"
                    >
                      <option value="All">All States</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>

                  {/* Reset button */}
                  <button
                    onClick={clearAllOrders}
                    className="p-2 border border-red-200 hover:bg-red-50 text-red-650 rounded-xl text-xs transition cursor-pointer"
                    title="Clear order records"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Grid or Table representing orders logs */}
              <div className="p-6">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl">
                    <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-gray-800">No Orders Match Filters</h4>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                      No payments match search criteria. Make a safe purchase in the active shopping cart to create real-time analytics!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((o) => (
                      <div
                        key={o.orderId}
                        className="p-5 border border-gray-150 rounded-2xl bg-white hover:shadow-xs transition space-y-4"
                        id={`order-log-${o.orderId}`}
                      >
                        {/* Upper row */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-50 pb-3 gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-gray-800 bg-stone-100 px-2.5 py-0.5 rounded-md">
                                #{o.orderId}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                {new Date(o.createdAt).toLocaleString()}
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-600 mt-1">
                              Buyer: <strong className="text-gray-900">{o.customerName}</strong> (<em>{o.customerEmail}</em>)
                            </p>
                          </div>

                          <div className="flex items-center gap-2.5">
                            {/* Dropdown status selector */}
                            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">Status:</span>
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.orderId, e.target.value as any)}
                              className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold border cursor-pointer outline-none ${
                                o.status === "Delivered"
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                  : o.status === "Shipped"
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : "bg-amber-100 text-amber-800 border-amber-200"
                              }`}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>

                            <button
                              onClick={() => deleteOrder(o.orderId)}
                              className="p-1 px-2 border border-red-101 text-red-500 rounded bg-red-50 hover:bg-red-500 hover:text-white hover:border-red-500 transition text-xs font-bold"
                              title="Dismiss Order"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>

                        {/* Mid Row: Items Purchased */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {o.items.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-center p-2 rounded-xl bg-gray-50/50 border border-gray-100/50">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-12 h-12 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <h5 className="text-xs font-semibold text-gray-900 truncate" title={item.title}>
                                  {item.title}
                                </h5>
                                <p className="text-[10px] text-gray-500 mt-0.5 font-mono">
                                  ${item.price.toFixed(2)} × {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Lower total row representation */}
                        <div className="flex justify-between items-center bg-stone-50/70 p-3 rounded-xl border border-gray-50/50 text-xs">
                          <span className="text-gray-500 font-sans font-medium">Payment total calculated:</span>
                          <span className="font-serif text-ink font-bold text-sm">
                            ${o.totalAmount.toFixed(2)}
                          </span>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SINGLE PRODUCT ANALYTICS MODULE */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6" id="single-product-analytics-panel">
              <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-olive" />
                    Deep Product Metrics & Single Item Analytics
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Select any catalog item to reveal granular customer checkouts, income velocity, and replenishment alerts.
                  </p>
                </div>

                {/* Dropdown Selector */}
                {adminProducts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 font-semibold whitespace-nowrap">Select Item:</span>
                    <select
                      value={searchParams.get("productId") || (adminProducts[0]._id || adminProducts[0].id || "")}
                      onChange={(e) => setSearchParams({ productId: e.target.value })}
                      className="text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-olive focus:border-olive cursor-pointer max-w-xs font-semibold"
                    >
                      {adminProducts.map((p) => (
                        <option key={p._id || p.id} value={p._id || p.id}>
                          {p.title} (${p.price})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Detail Content */}
              {(() => {
                const activeProductId = searchParams.get("productId") || (adminProducts.length > 0 ? (adminProducts[0]._id || adminProducts[0].id) : "");
                const activeProduct = adminProducts.find(p => (p._id || p.id) === activeProductId);

                if (!activeProduct) {
                  return (
                    <div className="text-center py-12 text-sm text-stone-400 font-medium">
                      Please add or select a product to display single item dashboard metrics.
                    </div>
                  );
                }

                const pId = activeProduct._id || activeProduct.id || "";
                const unitsSold = productSalesMap[pId] || 0;
                const revenue = unitsSold * activeProduct.price;
                const stockValue = activeProduct.stock * activeProduct.price;
                
                // Get orders containing this product
                const associatedOrders = realOrders.filter((o) =>
                  o.items.some((item) => item.productId === pId)
                );

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id={`single-product-view-${pId}`}>
                    {/* Column 1: Info and key stats */}
                    <div className="lg:col-span-1 bg-stone-50/50 rounded-2xl border border-stone-200/50 p-5 space-y-5">
                      <div className="flex gap-4 items-center">
                        <img
                          src={activeProduct.image}
                          alt={activeProduct.title}
                          className="w-20 h-20 object-cover rounded-xl border border-stone-200 shadow-2xs bg-white flex-shrink-0 animate-scale-up"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-1 min-w-0">
                          <span className="inline-block text-[10px] uppercase font-mono bg-olive/10 text-olive px-2 py-0.5 rounded font-bold">
                            {activeProduct.category}
                          </span>
                          <h4 className="text-sm font-bold text-stone-900 leading-tight truncate" title={activeProduct.title}>
                            {activeProduct.title}
                          </h4>
                          <p className="text-xs font-mono font-bold text-olive">
                            Unit Price: ${activeProduct.price.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-stone-500 leading-relaxed font-sans line-clamp-3">
                        {activeProduct.description}
                      </p>

                      <div className="border-t border-stone-200/60 pt-4 grid grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-stone-200/60 text-center">
                          <p className="text-[10px] uppercase tracking-wider font-mono text-stone-400">Stock Remainder</p>
                          <p className="text-lg font-serif font-black text-stone-800 mt-1">{activeProduct.stock} units</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-stone-200/60 text-center">
                          <p className="text-[10px] uppercase tracking-wider font-mono text-stone-400">Total Units Sold</p>
                          <p className="text-lg font-serif font-black text-olive mt-1">{unitsSold} units</p>
                        </div>
                      </div>

                      <div className="space-y-3.5 pt-2">
                        {/* Status bar */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-stone-500 font-semibold">Stock Status:</span>
                          {activeProduct.stock <= 0 ? (
                            <span className="text-[10px] font-mono font-bold uppercase text-red-650 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">Out of Stock</span>
                          ) : activeProduct.stock <= 3 ? (
                            <span className="text-[10px] font-mono font-bold uppercase text-amber-705 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full animate-pulse">Critical Low</span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">Optimal Level</span>
                          )}
                        </div>

                        {/* Created By */}
                        <div className="flex justify-between items-center text-xs border-t border-stone-150 pt-3">
                          <span className="text-stone-500 font-semibold">Publisher:</span>
                          <span className="text-[11px] font-mono text-stone-605 font-bold truncate max-w-[150px]" title={activeProduct.createdBy}>
                            {activeProduct.createdBy === "system" ? "Default Catalog" : activeProduct.createdBy}
                          </span>
                        </div>

                        {/* Quick action buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-150">
                          <button
                            type="button"
                            onClick={() => navigate(`/edit-product/${pId}`)}
                            className="inline-flex justify-center items-center py-2 bg-black hover:bg-stone-800 text-white font-semibold rounded-lg text-xs transition active:scale-98 cursor-pointer"
                          >
                            Edit Item
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`Delete product "${activeProduct.title}"?`)) {
                                try {
                                  await API.delete(`/products/${pId}`);
                                  // Refresh data
                                  fetchDashboardData();
                                } catch (_) {
                                  alert("Could not delete product.");
                                }
                              }
                            }}
                            className="inline-flex justify-center items-center py-2 bg-red-50 hover:bg-red-100/85 border border-red-200 text-red-650 font-semibold rounded-lg text-xs transition active:scale-98 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Performance metrics bento */}
                    <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* REVENUE */}
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-mono uppercase font-bold text-stone-500">Gross Item Revenue</p>
                            <p className="text-xl font-serif font-black text-emerald-800">${revenue.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* STOCK VALUE */}
                        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-mono uppercase font-bold text-stone-500">Remaining Inventory Value</p>
                            <p className="text-xl font-serif font-black text-amber-800">${stockValue.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Orders log table specifically for this product */}
                      <div className="bg-white border border-stone-200 rounded-[18px] p-4 flex-grow flex flex-col justify-start space-y-3">
                        <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider font-mono">
                          Customer Dispatches for this item ({associatedOrders.length} orders)
                        </h4>

                        {associatedOrders.length === 0 ? (
                          <div className="flex-grow flex flex-col items-center justify-center py-8 text-center bg-stone-50/50 border border-stone-100/60 rounded-xl">
                            <Receipt className="w-8 h-8 text-stone-300 mb-2" />
                            <p className="text-[11px] font-semibold text-stone-400">No client dispatches logged yet.</p>
                            <p className="text-[9px] text-stone-400 max-w-xs mt-0.5">Purchases checked out with this item in cart will generate logs here.</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto max-h-[160px] scrollbar-none">
                            <table className="w-full text-left text-xs text-stone-600">
                              <thead>
                                <tr className="border-b border-stone-100 text-[10px] font-mono uppercase text-stone-400 pb-2">
                                  <th className="py-2">Order ID</th>
                                  <th>Customer Details</th>
                                  <th className="text-center">Qty bought</th>
                                  <th className="text-right">Price</th>
                                  <th className="text-right">Dispatch</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-50">
                                {associatedOrders.map((o) => {
                                  const cartItem = o.items.find(item => item.productId === pId);
                                  const qty = cartItem ? cartItem.quantity : 0;
                                  const pricePaid = cartItem ? cartItem.price * qty : 0;

                                  return (
                                    <tr key={o.orderId} className="hover:bg-stone-50/50">
                                      <td className="py-2.5 font-mono font-bold text-stone-900">#{o.orderId}</td>
                                      <td>
                                        <div className="font-semibold text-stone-800 truncate max-w-[150px]">{o.customerName}</div>
                                        <div className="text-[10px] text-stone-400 truncate max-w-[150px]">{o.customerEmail}</div>
                                      </td>
                                      <td className="text-center font-bold text-stone-800">{qty}</td>
                                      <td className="text-right font-mono font-bold text-stone-900">${pricePaid.toFixed(2)}</td>
                                      <td className="text-right">
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                                          o.status === "Delivered"
                                            ? "bg-emerald-50 text-emerald-700"
                                            : o.status === "Shipped"
                                            ? "bg-blue-50 text-blue-700"
                                            : "bg-amber-50 text-amber-700"
                                        }`}>
                                          {o.status}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </>
        )}

      </div>
    </div>
  );
}
