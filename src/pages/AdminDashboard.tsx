import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { Product } from "../types";
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

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  createdAt: string;
  totalAmount: number;
  status: "Processing" | "Shipped" | "Delivered";
}

// Base mock orders to make the dashboard look gorgeous on first load if no orders exist yet
const INITIAL_DEMO_ORDERS = [
  {
    orderId: "ORD-9128-44",
    customerName: "Alex Vance",
    customerEmail: "alex@minimalism.io",
    items: [
      {
        productId: "demo-1",
        title: "Aura Premium Speckled Vase",
        price: 89.0,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80",
      },
      {
        productId: "demo-2",
        title: "Minimal Solid Timber Stool",
        price: 240.0,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=600&auto=format&fit=crop&q=80",
      }
    ],
    createdAt: new Date(Date.now() - 36*3600*1000).toISOString(), // 36 hours ago
    totalAmount: 329.0,
    status: "Shipped" as const,
  },
  {
    orderId: "ORD-4191-88",
    customerName: "Sarah Jenkins",
    customerEmail: "sarah.j@designstudio.com",
    items: [
      {
        productId: "demo-3",
        title: "Matte Alabaster Scented Candle",
        price: 45.0,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1508669232496-137b159c1cdb?w=600&auto=format&fit=crop&q=80",
      }
    ],
    createdAt: new Date(Date.now() - 12*3600*1000).toISOString(), // 12 hours ago
    totalAmount: 90.0,
    status: "Processing" as const,
  },
  {
    orderId: "ORD-7281-12",
    customerName: "Liam Sterling",
    customerEmail: "l.sterling@techcorp.org",
    items: [
      {
        productId: "demo-4",
        title: "Monochrome Cotton Rib Bedset",
        price: 185.0,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80",
      }
    ],
    createdAt: new Date(Date.now() - 84*3600*1000).toISOString(), // ~3.5 days ago
    totalAmount: 185.0,
    status: "Delivered" as const,
  }
];

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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

      // 2. Load orders from localStorage
      const storedOrdersStr = localStorage.getItem("aura_completed_orders");
      if (storedOrdersStr) {
        setOrders(JSON.parse(storedOrdersStr));
      } else {
        // Populate defaults to look beautiful and active
        localStorage.setItem("aura_completed_orders", JSON.stringify(INITIAL_DEMO_ORDERS));
        setOrders(INITIAL_DEMO_ORDERS);
      }
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

  // Handle Order Status Mutation
  const updateOrderStatus = (orderId: string, newStatus: "Processing" | "Shipped" | "Delivered") => {
    const updated = orders.map((o) => {
      if (o.orderId === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    setOrders(updated);
    localStorage.setItem("aura_completed_orders", JSON.stringify(updated));
  };

  // Handle Order Deletion
  const deleteOrder = (orderId: string) => {
    if (!window.confirm(`Are you sure you want to dismiss or remove order #${orderId}?`)) {
      return;
    }
    const filtered = orders.filter((o) => o.orderId !== orderId);
    setOrders(filtered);
    localStorage.setItem("aura_completed_orders", JSON.stringify(filtered));
  };

  const clearAllOrders = () => {
    if (!window.confirm("Danger: Proceeding will reset the orders database. Ready?")) {
      return;
    }
    localStorage.setItem("aura_completed_orders", JSON.stringify([]));
    setOrders([]);
  };

  // Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const completedOrdersCount = orders.length;
  const averageOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;
  
  // Units remaining
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  
  // Inventory value (price * stock)
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);

  // Number of low stock products (less than 5 stock)
  const lowStockCount = products.filter((p) => p.stock !== undefined && p.stock < 5).length;

  // Compute Units Sold per product dynamically based on orders
  const productSalesMap: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      productSalesMap[item.productId] = (productSalesMap[item.productId] || 0) + item.quantity;
    });
  });

  // Calculate high selling category counts
  const categorySalesMap: Record<string, number> = {};
  const categoryCountMap: Record<string, number> = {};
  
  products.forEach((p) => {
    categoryCountMap[p.category] = (categoryCountMap[p.category] || 0) + 1;
  });

  orders.forEach((o) => {
    o.items.forEach((item) => {
      // Find the category of the item
      const linkedProduct = products.find((p) => (p._id || p.id) === item.productId);
      const cat = linkedProduct ? linkedProduct.category : "Design Essentials";
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + (item.price * item.quantity);
    });
  });

  // Sort categories by sales revenue
  const topCategories = Object.entries(categorySalesMap)
    .map(([category, revenue]) => ({ category, revenue, count: categoryCountMap[category] || 0 }))
    .sort((a, b) => b.revenue - a.revenue);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
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
            <div className="flex items-center gap-2 text-stone-550 mb-1">
              <Link to="/profile" className="text-xs hover:underline flex items-center gap-1 font-semibold text-olive/90">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
              </Link>
              <span className="text-gray-300">•</span>
              <span className="text-xs font-mono bg-stone-100 text-stone-605 px-2 py-0.5 rounded-md">Administration Control</span>
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
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing || loading}
              className="px-4 py-2 bg-white hover:bg-gray-100/80 border border-gray-200 text-stone-650 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Sync Live Status
            </button>
            <Link
              to="/products"
              className="px-4 py-2 bg-black hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Package className="w-3.5 h-3.5" />
              Manage Catalogue
            </Link>
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
                    <span>+100% (Simulation)</span>
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
                  {products.length === 0 ? (
                    <div className="py-10 text-center text-xs text-gray-400">No active products to trace.</div>
                  ) : (
                    products
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

          </>
        )}

      </div>
    </div>
  );
}
