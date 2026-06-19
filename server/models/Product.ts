import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, index: true },
    image: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    createdBy: { type: String, default: "system" },
  },
  {
    timestamps: true,
  }
);

export const Product = (mongoose.models.Product || mongoose.model("Product", ProductSchema)) as any;

