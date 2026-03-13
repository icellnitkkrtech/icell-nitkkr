import express from "express"
import { getBlogs, createBlog } from "../controllers/blogController.js"
import verifyUser from "../middleware/authMiddleware.js"
import { isAdmin } from "../middleware/adminMiddleware.js"

const router = express.Router()

router.get("/", getBlogs)

router.post("/", verifyUser, isAdmin, createBlog)

export default router