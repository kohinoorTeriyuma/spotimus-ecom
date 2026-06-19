import mongoose from "mongoose";

let isConnecting = false;
let isConnected = false;

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      "❌ DATABASE ERROR: MONGO_URI environment variable is missing. A valid MongoDB connection is required."
    );
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
    throw new Error(
      `❌ DATABASE ERROR: Failed to connect to MongoDB: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export function isMongoConnected() {
  return isConnected;
}

