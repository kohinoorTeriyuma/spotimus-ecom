import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  promoteToAdmin,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import { validateRegister, validateLogin } from "../middleware/validationMiddleware";

const router = Router();

// Public routes with validation
router.post("/register", validateRegister as any, registerUser);
router.post("/login", validateLogin as any, loginUser);
router.post("/logout", logoutUser);

// Protected routes
router.get("/profile", protect as any, getUserProfile as any);
router.post("/make-admin", protect as any, promoteToAdmin as any);

export default router;
