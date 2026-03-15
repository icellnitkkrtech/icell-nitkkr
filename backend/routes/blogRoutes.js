
import express from "express"
import {
  getBlogs,
  getAllBlogsAdmin,
  getBlogById,
  createBlog,
  patchBlogStatus,
} from "../controllers/blogController.js"

import verifyUser from "../middleware/authMiddleware.js"
import verifyAdmin from "../middleware/adminMiddleware.js"

const router = express.Router()

// ✅ RULE: named routes ALWAYS before /:id wildcard
// If "admin" comes after /:id, Express treats "admin" as an ID param

router.get("/admin/all", verifyUser, verifyAdmin, getAllBlogsAdmin)
router.post("/", verifyUser, createBlog)
router.patch("/:id/status", verifyUser, verifyAdmin, patchBlogStatus)
router.get("/", getBlogs)
router.get("/:id", getBlogById)
router.get("/:id", getBlogById)

export default router