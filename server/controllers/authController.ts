import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { isEmailInAdminEnv, isUserAdmin } from "../utils/adminCheck";

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 */
export async function registerUser(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, title } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400).json({ message: "Please provide all required fields." });
      return;
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res
        .status(400)
        .json({ message: "User already exists with that email address." });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // If their email is found in the admin variable list, auto-promote title to admin.
    // Also support custom registration parameter if supplied (or default to 'user')
    const hasAdminEmail = isEmailInAdminEnv(email);
    const finalTitle = hasAdminEmail ? "admin" : (title || "user");

    // Save database user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      title: finalTitle,
    });

    // Generate JWT Token
    const token = generateToken(newUser._id || newUser.id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    });

    res.status(201).json({
      token,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        title: newUser.title,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Register user controller error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to register user." });
  }
}

/**
 * @desc Authenticate user & get token
 * @route POST /api/auth/login
 */
export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ message: "Please enter email and password." });
      return;
    }

    // Find User
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    // Validate Password
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    // Auto-verify if they should have admin title if their email is now in `.env` admin
    let updatedTitle = user.title || "user";
    if (isEmailInAdminEnv(user.email) && updatedTitle !== "admin") {
      updatedTitle = "admin";
      await User.findByIdAndUpdate(user._id || user.id, { title: "admin" });
    }

    // Generate JWT Token
    const token = generateToken(user._id || user.id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    });

    res.status(200).json({
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        title: updatedTitle,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Login user controller error:", error);
    res.status(500).json({ message: error.message || "Failed to log in." });
  }
}

/**
 * @desc Logout user (Client-side clears cookies and state, server acts as 200)
 * @route POST /api/auth/logout
 */
export async function logoutUser(req: Request, res: Response): Promise<void> {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({ message: "Successfully logged out." });
}

/**
 * @desc Get authenticated user profiles
 * @route GET /api/auth/profile
 */
export async function getUserProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    // Auto-verify if they should have admin title
    let updatedTitle = req.user.title || "user";
    if (isEmailInAdminEnv(req.user.email) && updatedTitle !== "admin") {
      updatedTitle = "admin";
      await User.findByIdAndUpdate(req.user._id || req.user.id, { title: "admin" });
    }

    res.status(200).json({
      user: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        title: updatedTitle,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Get user profile controller error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to match profile user." });
  }
}

/**
 * @desc Promote current user to admin
 * @route POST /api/auth/make-admin
 */
export async function promoteToAdmin(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated. Please log in or register." });
      return;
    }

    const userId = req.user._id || req.user.id;
    const updatedUser = await User.findByIdAndUpdate(userId, { title: "admin" });

    res.status(200).json({
      message: "Successfully promoted to administrator status.",
      user: {
        id: updatedUser._id || updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        title: "admin",
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Promote to admin controller error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to promote to admin." });
  }
}
