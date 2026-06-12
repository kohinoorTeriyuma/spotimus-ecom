import mongoose from "mongoose";

let isConnecting = false;
let isConnected = false;

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.log(
      "⚠️ MONGO_URI environment variable is missing. Running in local JSON file-based database fallback mode."
    );
    return false;
  }

  if (isConnected || isConnecting) {
    return true;
  }

  isConnecting = true;
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    isConnecting = false;
    console.log(`📡 MongoDB Connected Safely: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnecting = false;
    console.error("❌ MongoDB connection error:", error);
    console.log("⚠️ Falling back to local JSON file-based database mode.");
    return false;
  }
}

export function isMongoConnected() {
  return isConnected;
}
