import { Request, Response } from "express";
import { Product } from "../models/Product";
import { uploadImage } from "../config/cloudinary";

const DEFAULT_PLACEHOLDERS: Record<string, string> = {
  Electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80",
  Mobiles:
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
  Laptops:
    "https://images.unsplash.com/photo-1496181130204-755241524eab?w=600&auto=format&fit=crop&q=80",
  Fashion:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80",
  Shoes:
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
  Books:
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop&q=80",
  Accessories:
    "https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=600&auto=format&fit=crop&q=80",
  "Home Appliances":
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80",
};

/**
 * @desc Get all products
 * @route GET /api/products
 */
export async function getAllProducts(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error: any) {
    console.error("Get all products error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to fetch products." });
  }
}

/**
 * @desc Get single product detail
 * @route GET /api/products/:id
 */
export async function getProductById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    res.status(200).json(product);
  } catch (error: any) {
    console.error("Get product detail error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to search product." });
  }
}

/**
 * @desc Put / edit product detail
 * @route PUT /api/products/:id
 */
export async function updateProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const { title, description, price, category, stock } = req.body;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      res.status(404).json({ message: "Product to update not found." });
      return;
    }

    let imageUrl = existingProduct.image;
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const updatedData = {
      title: title || existingProduct.title,
      description: description || existingProduct.description,
      price: price !== undefined ? Number(price) : existingProduct.price,
      category: category || existingProduct.category,
      stock: stock !== undefined ? Number(stock) : existingProduct.stock,
      image: imageUrl,
    };

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    res.status(200).json(updatedProduct);
  } catch (error: any) {
    console.error("Update product error:", error);
    res
      .status(500)
      .json({ message: error.message || "Product updating failed." });
  }
}

/**
 * @desc Delete a product
 * @route DELETE /api/products/:id
 */
export async function deleteProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      res.status(404).json({ message: "Product to delete not found." });
      return;
    }

    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error: any) {
    console.error("Delete product error:", error);
    res
      .status(500)
      .json({ message: error.message || "Product deletion failed." });
  }
}

/**
 * @desc Post / Create a new product
 * @route POST /api/products
 */
export async function createProduct(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { title, description, price, category, stock } = req.body;

    if (!title || !description || !price || !category) {
      res.status(400).json({ message: "Missing required product fields." });
      return;
    }

    // Determine upload URL
    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    } else if (req.body.image) {
      imageUrl = req.body.image;
    } else {
      // Use category-specific or general fallback
      imageUrl =
        DEFAULT_PLACEHOLDERS[category] ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
    }

    const newProduct = await Product.create({
      title,
      description,
      price: Number(price),
      category,
      stock: stock !== undefined ? Number(stock) : 10,
      image: imageUrl,
    });

    res.status(201).json(newProduct);
  } catch (error: any) {
    console.error("Create product error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to create product." });
  }
}

/**
 * @desc Get products by category
 * @route GET /api/products/category/:category
 */
export async function getProductsByCategory(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { category } = req.params;
    // Database search is case sensitive unless matched or query optimized.
    // In our fallback we filter nicely, let's normalize cases if needed, but standard query first
    const products = await Product.find({
      category: { $regex: new RegExp("^" + category + "$", "i") },
    });

    // In case Mongoose query wasn't matching the regex format easily in our json fallback,
    // let's do direct match too
    if (products.length === 0) {
      const all = await Product.find({});
      const filtered = all.filter(
        (p: any) => p.category.toLowerCase() === category.toLowerCase()
      );
      res.status(200).json(filtered);
      return;
    }

    res.status(200).json(products);
  } catch (error: any) {
    console.error("Get products by category error:", error);
    res
      .status(500)
      .json({ message: error.message || "Category query execution failed." });
  }
}
