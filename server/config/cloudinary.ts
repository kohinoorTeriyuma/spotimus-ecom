import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

const uploadsDir = path.join(process.cwd(), "uploads");

// Ensure local uploads directory exists for fallbacks
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Check if Cloudinary credentials are fully configured
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("☁️ Cloudinary file upload system is fully configured.");
} else {
  console.log(
    "⚠️ Cloudinary credentials are missing. Falling back to local server file storage in '/uploads'."
  );
}

/**
 * Uploads an image file to either Cloudinary (if configured) or local disk.
 * Returns the URL of the uploaded image.
 */
export async function uploadImage(file: Express.Multer.File): Promise<string> {
  if (isCloudinaryConfigured) {
    try {
      // Return a Promise wrapping Cloudinary upload stream
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "ecommerce-mvp" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              // Fallback to local upload to keep flow running
              resolve(saveLocalFile(file));
            } else if (result) {
              resolve(result.secure_url);
            } else {
              reject(new Error("Cloudinary upload failed with no description"));
            }
          }
        );
        uploadStream.end(file.buffer);
      });
    } catch (e) {
      console.error("Error during Cloudinary upload stream, falling back:", e);
      return saveLocalFile(file);
    }
  } else {
    return saveLocalFile(file);
  }
}

/**
 * Helper to save Multer file to the local uploads directory
 */
function saveLocalFile(file: Express.Multer.File): string {
  const extension = path.extname(file.originalname) || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${extension}`;
  const filepath = path.join(uploadsDir, filename);

  fs.writeFileSync(filepath, file.buffer);
  console.log(`💾 Image saved locally under: /uploads/${filename}`);

  // Return the public path route. The server serves '/uploads' statically.
  return `/uploads/${filename}`;
}
