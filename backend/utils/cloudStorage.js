const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {String} folder - Folder name in Cloudinary (e.g., 'menu')
 * @returns {Promise<String>} - Public URL of uploaded image
 */
const uploadToCloudinary = (fileBuffer, folder = "menu") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `food-app/${folder}`,
        resource_type: "image",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    // Convert buffer to stream
    const stream = Readable.from(fileBuffer);
    stream.pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary
 * @param {String} imageUrl - Full URL or public_id of image
 * @returns {Promise}
 */
const deleteFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/food-app/menu/image.jpg
    const urlParts = imageUrl.split("/");
    const uploadIndex = urlParts.findIndex((part) => part === "upload");
    
    if (uploadIndex === -1) {
      console.warn("Invalid Cloudinary URL:", imageUrl);
      return;
    }

    // Get public_id (everything after /upload/)
    const publicIdParts = urlParts.slice(uploadIndex + 2); // Skip 'upload' and version
    const publicId = publicIdParts.join("/").replace(/\.[^/.]+$/, ""); // Remove extension

    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === "ok") {
      console.log("✅ Deleted image from Cloudinary:", publicId);
    } else {
      console.warn("⚠️ Failed to delete image from Cloudinary:", publicId);
    }
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
  }
};

/**
 * Check if URL is a Cloudinary URL
 * @param {String} url - Image URL
 * @returns {Boolean}
 */
const isCloudinaryUrl = (url) => {
  return url && url.includes("cloudinary.com");
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  isCloudinaryUrl,
};

