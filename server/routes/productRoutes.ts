import { Router } from "express";
import multer from "multer";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
} from "../controllers/productController";
import { protect, adminProtect } from "../middleware/authMiddleware";

const router = Router();

// Setup Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit of 5MB files
  },
});

// GET paths are public
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.get("/category/:category", getProductsByCategory);

// Write/Edit operations are protected by logged-in JWT authorization and Admin access checks
router.post("/", protect as any, adminProtect as any, upload.single("image"), createProduct);
router.put("/:id", protect as any, adminProtect as any, upload.single("image"), updateProduct);
router.delete("/:id", protect as any, adminProtect as any, deleteProduct);

export default router;
