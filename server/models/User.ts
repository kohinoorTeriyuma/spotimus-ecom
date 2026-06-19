import mongoose, { Schema } from "mongoose";

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

export const User = (mongoose.models.User || mongoose.model("User", UserSchema)) as any;

