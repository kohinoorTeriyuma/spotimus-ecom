import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { ArrowLeft, Upload, Edit3, Check, AlertCircle } from "lucide-react";
import Loader from "../components/Loader";

const CATEGORIES = [
  "Electronics",
  "Mobiles",
  "Laptops",
  "Fashion",
  "Shoes",
  "Books",
  "Accessories",
  "Home Appliances",
];

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [stock, setStock] = useState("");

  // Existing image from server
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  // New Image selection states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Status indicators
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/products/${id}`);
        const product = res.data;

        setTitle(product.title);
        setDescription(product.description);
        setPrice(product.price.toString());
        setCategory(product.category);
        setStock(product.stock.toString());
        setExistingImageUrl(product.image);
      } catch (err: any) {
        console.error("Failed to fetch product for editing:", err);
        setError("Error loading product information from database.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  // Drag-and-Drop file uploads
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        processFile(file);
      } else {
        setError("Please drop a valid image file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title || !description || !price || !category || !stock) {
      setError("Please complete all requested details.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("stock", stock);

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (existingImageUrl) {
        formData.append("image", existingImageUrl);
      }

      await API.put(`/products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      setTimeout(() => {
        navigate(`/product/${id}`);
      }, 1500);
    } catch (err: any) {
      console.error("Edit product PUT error:", err);
      setError(
        err.response?.data?.message || "Failed to update product details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50/20">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans" id="edit-product-view">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to listings
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
          <div className="border-b border-gray-100 pb-5 mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-sans font-bold tracking-tight text-gray-950 flex items-center gap-1.5">
                <Edit3 className="w-5.5 h-5.5 text-gray-805" /> Edit Product Catalog Details
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Refine pricing, details, catalogs, or swap the product display image.
              </p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {error && (
              <div className="flex bg-red-50 text-red-650 p-4 rounded-xl text-sm gap-2.5 items-center">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm gap-2.5 items-center">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span>Product updated successfully! Redirecting back to view detail...</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Title */}
              <div className="md:col-span-2">
                <label htmlFor="edit-title" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Product Title
                </label>
                <input
                  id="edit-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 block w-full px-4 py-2.5 sm:text-sm bg-gray-50/50 border border-gray-150 focus:border-black focus:ring-black rounded-xl focus:bg-white outline-hidden transition"
                />
              </div>

              {/* Price */}
              <div>
                <label htmlFor="edit-price" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Listing price ($)
                </label>
                <input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1.5 block w-full px-4 py-2.5 sm:text-sm bg-gray-50/50 border border-gray-150 focus:border-black focus:ring-black rounded-xl focus:bg-white outline-hidden transition"
                />
              </div>

              {/* Stock */}
              <div>
                <label htmlFor="edit-stock" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Inventory Stock
                </label>
                <input
                  id="edit-stock"
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="mt-1.5 block w-full px-4 py-2.5 sm:text-sm bg-gray-50/50 border border-gray-150 focus:border-black focus:ring-black rounded-xl focus:bg-white outline-hidden transition"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="edit-category" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Catalog Category
                </label>
                <select
                  id="edit-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1.5 block w-full px-4 py-2.5 sm:text-sm bg-gray-50/50 border border-gray-150 focus:border-black focus:ring-black rounded-xl focus:bg-white outline-hidden transition"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description textarea */}
            <div>
              <label htmlFor="edit-desc" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Detailed Description
              </label>
              <textarea
                id="edit-desc"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 block w-full px-4 py-2.5 sm:text-sm bg-gray-50/50 border border-gray-150 focus:border-black focus:ring-black rounded-xl focus:bg-white outline-hidden transition"
              />
            </div>

            {/* Drag and Drop replacement selector container */}
            <div>
              <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Replace Display Image
              </span>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-44 ${
                  isDragOver
                    ? "border-black bg-gray-50"
                    : previewUrl
                    ? "border-emerald-300 bg-emerald-50/10"
                    : "border-gray-250 hover:border-gray-400 bg-gray-50/50"
                }`}
                id="edit-dropzone-uploader"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={previewUrl}
                      alt="Product swap preview"
                      className="w-24 h-24 object-cover rounded-xl border"
                    />
                    <p className="text-xs font-medium text-emerald-800">✓ New Image Stage Loaded</p>
                    <span className="text-[10px] text-gray-400">Click to change</span>
                  </div>
                ) : existingImageUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={existingImageUrl}
                      alt="Original display catalog"
                      className="w-24 h-24 object-cover rounded-xl border border-gray-150"
                    />
                    <p className="text-[10px] text-gray-500 font-medium">Currently Selected Image</p>
                    <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Drag & Drop image to swap
                    </span>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600 mt-2">Upload product image file</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submissions */}
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-55 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-charcoal active:scale-98 transition shadow-sm disabled:bg-gray-400 cursor-pointer"
                id="edit-prod-submit-btn"
              >
                {submitting ? "Saving Updates..." : "Save Product Details"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
