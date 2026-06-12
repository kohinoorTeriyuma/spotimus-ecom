import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { ArrowLeft, Upload, Sparkles, Check, AlertCircle } from "lucide-react";

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

export default function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [stock, setStock] = useState("10");

  // File Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Submit states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Drag & Drop event handlers
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
        setError("Please drop a valid image file (PNG, JPG, JPEG, WEBP).");
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
      setError("Please fill in all requested fields.");
      return;
    }

    setSubmitting(true);

    try {
      // Build Multer multipart payload
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("stock", stock);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await API.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/products");
      }, 1500);
    } catch (err: any) {
      console.error("Add product submission error:", err);
      setError(
        err.response?.data?.message || "Failed to add product to catalog."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans" id="add-product-page">
      <div className="max-w-3xl mx-auto">
        {/* Back Link panel */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black mb-6 transition"
          id="add-prod-back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Previous
        </button>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
          <div className="border-b border-gray-100 pb-5 mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-sans font-bold tracking-tight text-gray-950">
                Register New Product
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Enter details, categorizations, inventories, and catalog imagery.
              </p>
            </div>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Feedback notifications */}
            {error && (
              <div className="flex bg-red-50 text-red-650 p-4 rounded-xl text-sm gap-2.5 items-center" id="add-product-error">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm gap-2.5 items-center" id="add-product-success">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span>Product created successfully! Redirecting back to catalog listings...</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Title Input */}
              <div className="md:col-span-2">
                <label htmlFor="prod-title" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Product Title
                </label>
                <input
                  id="prod-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sony Premium Over-Ear Audio Set"
                  className="mt-1.5 block w-full px-4 py-2.5 sm:text-sm bg-gray-50/50 border border-gray-150 focus:border-black focus:ring-black rounded-xl focus:bg-white outline-hidden transition"
                />
              </div>

              {/* Price input fields */}
              <div>
                <label htmlFor="prod-price" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Listing price ($)
                </label>
                <input
                  id="prod-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="399.00"
                  className="mt-1.5 block w-full px-4 py-2.5 sm:text-sm bg-gray-50/50 border border-gray-150 focus:border-black focus:ring-black rounded-xl focus:bg-white outline-hidden transition"
                />
              </div>

              {/* Stock input check */}
              <div>
                <label htmlFor="prod-stock" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Inventory Stock Count
                </label>
                <input
                  id="prod-stock"
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  className="mt-1.5 block w-full px-4 py-2.5 sm:text-sm bg-gray-50/50 border border-gray-150 focus:border-black focus:ring-black rounded-xl focus:bg-white outline-hidden transition"
                />
              </div>

              {/* Category picker select input */}
              <div>
                <label htmlFor="prod-category" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Catalog Category
                </label>
                <select
                  id="prod-category"
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
              <label htmlFor="prod-desc" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Detailed Description
              </label>
              <textarea
                id="prod-desc"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="List key product parameters, size ranges, warranties, specifications, and audio enhancements..."
                className="mt-1.5 block w-full px-4 py-2.5 sm:text-sm bg-gray-50/50 border border-gray-150 focus:border-black focus:ring-black rounded-xl focus:bg-white outline-hidden transition"
              />
            </div>

            {/* Drag-and-Drop and Manual Click File Upload component selector container */}
            <div>
              <span className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Catalog Product Image
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
                id="image-dropzone-uploader"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                    <img
                      src={previewUrl}
                      alt="Thumbnail product upload preview"
                      className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-xs"
                    />
                    <div className="text-center">
                      <p className="text-xs font-medium text-emerald-800">✓ Image Loaded Successfully</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">{imageFile?.name}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 underline">Click / drop alternative to swap</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700">Drag & Drop product image here</p>
                    <p className="text-xs text-gray-400 mt-1">or click to browse your desktop storage</p>
                    <span className="text-[10px] text-gray-400 mt-3 font-mono">PNG, JPG, JPEG, WEBP up to 5MB</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submission buttons */}
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="px-5 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-55 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-charcoal active:scale-98 transition shadow-sm disabled:bg-gray-400 cursor-pointer"
                id="add-prod-submit-btn"
              >
                {submitting ? "Registering Item..." : "Publish Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
