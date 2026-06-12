import mongoose, { Schema } from "mongoose";
import { fallbackDB } from "../utils/dbFallback";

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

let MongooseProductModel: any;
try {
  MongooseProductModel =
    mongoose.models.Product || mongoose.model("Product", ProductSchema);
} catch (e) {
  MongooseProductModel = mongoose.model("Product", ProductSchema);
}

export const Product = {
  find: async (query: any = {}) => {
    return process.env.MONGO_URI
      ? MongooseProductModel.find(query).sort({ createdAt: -1 }).lean()
      : fallbackDB.Product.find(query);
  },

  findOne: async (query: any) => {
    return process.env.MONGO_URI
      ? MongooseProductModel.findOne(query).lean()
      : fallbackDB.Product.findOne(query);
  },

  findById: async (id: string) => {
    return process.env.MONGO_URI
      ? MongooseProductModel.findById(id).lean()
      : fallbackDB.Product.findById(id);
  },

  create: async (doc: any) => {
    return process.env.MONGO_URI
      ? MongooseProductModel.create(doc)
      : fallbackDB.Product.create(doc);
  },

  findByIdAndUpdate: async (id: string, update: any, options: any = {}) => {
    return process.env.MONGO_URI
      ? MongooseProductModel.findByIdAndUpdate(id, update, {
          new: true,
          ...options,
        }).lean()
      : fallbackDB.Product.findByIdAndUpdate(id, update, options);
  },

  findByIdAndDelete: async (id: string) => {
    return process.env.MONGO_URI
      ? MongooseProductModel.findByIdAndDelete(id).lean()
      : fallbackDB.Product.findByIdAndDelete(id);
  },

  countDocuments: async (query: any = {}) => {
    return process.env.MONGO_URI
      ? MongooseProductModel.countDocuments(query)
      : fallbackDB.Product.countDocuments(query);
  },
};
