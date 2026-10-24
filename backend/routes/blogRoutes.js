import express from "express";
import {
  getBlogs,
  getAllBlogsAdmin,
  getBlogById,
  createBlog,
  patchBlogStatus,
  deleteBlog,
  getUserBlogs,
} from "../controllers/blogController.js";
import verifyUser, { requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getBlogs);
router.get("/:id", getBlogById);

// Protected routes
router.post("/", verifyUser, createBlog);
router.get("/user/:userId", verifyUser, getUserBlogs);

// Admin routes
router.get("/admin/all", verifyUser, requireAdmin, getAllBlogsAdmin);
router.patch("/:id/status", verifyUser, requireAdmin, patchBlogStatus);
router.delete("/:id", verifyUser, deleteBlog);

export default router;
