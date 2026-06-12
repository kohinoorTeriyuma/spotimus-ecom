import mongoose, { Schema } from "mongoose";
import { fallbackDB } from "../utils/dbFallback";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    title: { type: String, default: "user" },
  },
  {
    timestamps: true,
  }
);

let MongooseUserModel: any;
try {
  MongooseUserModel =
    mongoose.models.User || mongoose.model("User", UserSchema);
} catch (e) {
  MongooseUserModel = mongoose.model("User", UserSchema);
}

export const User = {
  find: async (query: any = {}) => {
    return process.env.MONGO_URI
      ? MongooseUserModel.find(query).lean()
      : fallbackDB.User.find(query);
  },

  findOne: async (query: any) => {
    return process.env.MONGO_URI
      ? MongooseUserModel.findOne(query).lean()
      : fallbackDB.User.findOne(query);
  },

  findById: async (id: string) => {
    return process.env.MONGO_URI
      ? MongooseUserModel.findById(id).lean()
      : fallbackDB.User.findById(id);
  },

  create: async (doc: any) => {
    return process.env.MONGO_URI
      ? MongooseUserModel.create(doc)
      : fallbackDB.User.create(doc);
  },

  findByIdAndUpdate: async (id: string, update: any, options: any = {}) => {
    return process.env.MONGO_URI
      ? MongooseUserModel.findByIdAndUpdate(id, update, {
          new: true,
          ...options,
        }).lean()
      : fallbackDB.User.findByIdAndUpdate(id, update, options);
  },

  findByIdAndDelete: async (id: string) => {
    return process.env.MONGO_URI
      ? MongooseUserModel.findByIdAndDelete(id).lean()
      : fallbackDB.User.findByIdAndDelete(id);
  },

  countDocuments: async (query: any = {}) => {
    return process.env.MONGO_URI
      ? MongooseUserModel.countDocuments(query)
      : fallbackDB.User.countDocuments(query);
  },
};
