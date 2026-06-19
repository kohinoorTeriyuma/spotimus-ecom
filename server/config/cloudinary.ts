import { v2 as cloudinary } from "cloudinary";

// Check if Cloudinary credentials are fully configured
const isCloudinaryConfigured =
  !!(process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("☁️ Cloudinary file upload system is fully configured.");
} else {
  console.log(
    "⚠️ Cloudinary credentials are not configured. Image uploads will require CLOUDINARY env variables."
  );
}

/**
 * Uploads an image file to Cloudinary.
 * Returns the URL of the uploaded image. Throws an error if not configured or upload fails.
 */
export async function uploadImage(file: Express.Multer.File): Promise<string> {
  if (!isCloudinaryConfigured) {
    throw new Error(
      "❌ STORAGE ERROR: Cloudinary credentials are not configured. To upload files, please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment secrets."
    );
  }

  try {
    // Return a Promise wrapping Cloudinary upload stream
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "ecommerce-mvp" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            reject(new Error(`Cloudinary Upload Failed: ${error.message}`));
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error("Cloudinary upload returned no result."));
          }
        }
      );
      uploadStream.end(file.buffer);
    });
  } catch (e: any) {
    console.error("Error during Cloudinary upload stream:", e);
    throw new Error(`Cloudinary storage stream error: ${e.message || String(e)}`);
  }
}
