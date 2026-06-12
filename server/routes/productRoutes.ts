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
import {
  validateIdParam,
  validateCategoryParam,
  validateProductCreation,
  validateProductUpdate
} from "../middleware/validationMiddleware";

const router = Router();

// Setup Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit of 5MB files
  },
});

// GET paths are public (validated for security parameters)
router.get("/", getAllProducts);
router.get("/:id", validateIdParam as any, getProductById);
router.get("/category/:category", validateCategoryParam as any, getProductsByCategory);

// Write/Edit operations are protected by logged-in JWT authorization, Admin access checks, and thorough body validation
router.post(
  "/",
  protect as any,
  adminProtect as any,
  upload.single("image"),
  validateProductCreation as any,
  createProduct
);

router.put(
  "/:id",
  validateIdParam as any,
  protect as any,
  adminProtect as any,
  upload.single("image"),
  validateProductUpdate as any,
  updateProduct
);

router.delete(
  "/:id",
  validateIdParam as any,
  protect as any,
  adminProtect as any,
  deleteProduct
);

export default router;
