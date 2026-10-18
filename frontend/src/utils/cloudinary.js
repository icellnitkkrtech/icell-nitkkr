/**
 * Cloudinary Image Optimization Utility
 * Automatically injects Cloudinary transformations (f_auto, q_auto, width, height, crop)
 * to deliver lightweight, responsive WebP/AVIF images.
 */

/**
 * Optimizes a Cloudinary image URL by injecting dynamic transformations.
 *
 * @param {string} url - The original image URL (Cloudinary or otherwise)
 * @param {object} options - Transformation options
 * @param {number} [options.width] - Desired width in pixels (e.g. 600)
 * @param {number} [options.height] - Desired height in pixels
 * @param {string} [options.crop] - Crop mode: 'fill', 'limit', 'fit', 'scale'
 * @param {string} [options.quality='auto'] - Compression quality: 'auto', 'auto:good', 'auto:eco', etc.
 * @param {string} [options.format='auto'] - File format: 'auto' (WebP/AVIF depending on browser support)
 * @returns {string} The optimized URL (or original URL if not from Cloudinary)
 */
export function getOptimizedCloudinaryUrl(url, options = {}) {
  if (!url || typeof url !== "string") return url || "";

  // If not a Cloudinary image or already a data URI / SVG placeholder, return untouched
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  const {
    width,
    height,
    crop = width && height ? "fill" : width ? "limit" : undefined,
    quality = "auto",
    format = "auto",
  } = options;

  const transforms = [];

  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (width) transforms.push(`w_${Math.round(width)}`);
  if (height) transforms.push(`h_${Math.round(height)}`);
  if (crop && (width || height)) transforms.push(`c_${crop}`);

  if (transforms.length === 0) return url;

  const transformString = transforms.join(",");

  const uploadTag = "/image/upload/";
  const uploadIndex = url.indexOf(uploadTag);
  if (uploadIndex === -1) return url;

  const prefix = url.slice(0, uploadIndex + uploadTag.length);
  let rest = url.slice(uploadIndex + uploadTag.length);

  // Avoid duplicating transformations if already transformed
  if (rest.startsWith("f_auto") || rest.startsWith("q_auto") || rest.startsWith("w_")) {
    const nextSlash = rest.indexOf("/");
    if (nextSlash !== -1) {
      rest = rest.slice(nextSlash + 1);
    }
  }

  return `${prefix}${transformString}/${rest}`;
}

/**
 * Common presets for UI components
 */
export const CLOUDINARY_PRESETS = {
  // Gallery card thumbnail (400x250 container)
  thumbnail: { width: 600, height: 400, crop: "fill", quality: "auto", format: "auto" },
  // Hover preview carousel
  carousel: { width: 800, height: 500, crop: "fill", quality: "auto", format: "auto" },
  // Modal grid photo item
  modalGrid: { width: 600, height: 400, crop: "fill", quality: "auto", format: "auto" },
  // Full-screen modal / lightbox view
  lightbox: { width: 1400, crop: "limit", quality: "auto", format: "auto" },
};
