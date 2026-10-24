// Blog Schema
export const blogSchema = {
  _id: String, // UUID
  title: String,
  description: String,
  content: String,
  author: String, // Full Name
  author_id: String, // user id
  author_email: String, // user email
  category: String,
  tags: [String], // Array of tags e.g. ['ai', 'startup', 'webdev']
  read_time: Number, // Estimated reading time in minutes
  image: String, // Cloudinary URL or base64 fallback
  cloudinary_public_id: String, // Cloudinary asset ID for destruction
  links: String, // Optional related links
  status: String, // 'pending', 'approved', 'rejected'
  rejection_reason: String, // Admin feedback when rejected
  created_at: Date,
  updated_at: Date,
};
