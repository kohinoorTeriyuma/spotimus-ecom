import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { connectDB } from "./server/config/db";
import { Product } from "./server/models/Product";
import authRoutes from "./server/routes/authRoutes";
import productRoutes from "./server/routes/productRoutes";
import chatRoutes from "./server/routes/chatRoutes";
import { errorHandler } from "./server/middleware/errorHandler";

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);


dotenv.config();

const SEED_PRODUCTS = [
  {
    title: "Sony WH-1000XM5 ANC",
    description: "Industry-leading noise canceling wireless overhead headphones with premium sound fidelity, crystal-clear calls, and up to 30 hours of battery life.",
    price: 399,
    category: "Electronics",
    stock: 15,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "iPhone 15 Pro Titanium",
    description: "The new iPhone crafted in aerospace-grade titanium, featuring the groundbreaking A17 Pro chip, adaptive camera sensors, and USB-C speed support.",
    price: 1099,
    category: "Mobiles",
    stock: 8,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "MacBook Pro 16 M3 Max",
    description: "The absolute powerhouse laptop for developers, creators, and engineers, boasting a beautiful Liquid Retina XDR display and legendary efficiency.",
    price: 3199,
    category: "Laptops",
    stock: 5,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Classic Vintage Leather Jacket",
    description: "Timeless streetwear aesthetic crafted in 100% full-grain tanned leather. Soft interior lining with heavy-duty metal zippers.",
    price: 199,
    category: "Fashion",
    stock: 12,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "AeroForm Comfort Sneakers",
    description: "Ultra-breathable honeycomb athletic shoes featuring responsive foam cushioning and customized footbeds for daily walking or training.",
    price: 129,
    category: "Shoes",
    stock: 20,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "The Ultimate Guide to TypeScript",
    description: "Dive deep into modern TypeScript architecture, including design patterns, high-level typing, decorators, and backend scalability.",
    price: 49,
    category: "Books",
    stock: 35,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Minimalist Chronograph Watch",
    description: "Scandinavia-inspired modern watch with scratch-resistant sapphire crystal dome, stainless steel band, and water resistance up to 50 meters.",
    price: 249,
    category: "Accessories",
    stock: 10,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
  },
  {
    title: "Smart One-Touch Espresso Maker",
    description: "Barista-grade home espresso machine with built-it conical burr grinder, automatic milk frother texturing, and precise digital PID temp regulator.",
    price: 599,
    category: "Home Appliances",
    stock: 7,
    image: "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=600&auto=format&fit=crop&q=80",
  },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Essential Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static local uploads folder
  const uploadsPath = path.join(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadsPath));

  // Connect database
  const connected = await connectDB();

  // Seed default products if empty
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log("🌱 No products found in the database. Seeding default sample catalog...");
      for (const prod of SEED_PRODUCTS) {
        await Product.create(prod);
      }
      console.log("✅ Seed completed successfully! 8 products added.");
    }
  } catch (error) {
    console.error("⚠️ Failed to seed initial products:", error);
  }

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/chat", chatRoutes);

  // Central error handling
  app.use(errorHandler);

  // Front-end Asset serving through Vite Middleware in dev, or statically in prod
  if (process.env.NODE_ENV !== "production") {
    console.log("🚀 Mounting Vite middleware in Development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("🏠 Serving built production static assets from 'dist/'.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✨ FULL-STACK E-COMMERCE SERVER RUNNING ACTIVE AT: http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("🛑 Server failed to start:", err);
});
