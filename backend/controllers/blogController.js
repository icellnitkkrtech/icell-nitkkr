import * as blogModel from "../models/blogModel.js";
import { getDB } from "../config/mongodb.js";
import { verifyToken } from "../utils/jwt.js";
import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dpgkl1wq4",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/blogs — public, approved only (with optional category/tag filter)
export async function getBlogs(req, res) {
  try {
    const { category, tag } = req.query;
    const blogs = await blogModel.getBlogsByStatus("approved", { category, tag });
    res.json(blogs);
  } catch (error) {
    console.error("Get blogs error:", error);
    res.status(500).json({ error: "Failed to get blogs" });
  }
}

// GET /api/blogs/admin — admin only, all blogs
export async function getAllBlogsAdmin(req, res) {
  try {
    const blogs = await blogModel.getAllBlogs();
    res.json(blogs);
  } catch (error) {
    console.error("Get all blogs error:", error);
    res.status(500).json({ error: "Failed to get blogs" });
  }
}

// GET /api/blogs/:id — public for approved, author/admin for pending or rejected
export async function getBlogById(req, res) {
  try {
    const blog = await blogModel.getBlogById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // If blog is not approved, ensure only author or admin/post_holder can view
    if (blog.status !== "approved") {
      const authHeader = req.headers.authorization;
      let authorized = false;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        const payload = verifyToken(token);
        if (
          payload &&
          (payload.role === "admin" ||
            payload.role === "post_holder" ||
            payload.userId === blog.author_id)
        ) {
          authorized = true;
        }
      }
      if (!authorized) {
        return res
          .status(404)
          .json({ error: "Blog not found or pending approval" });
      }
    }

    // Fetch live author profile role, position, and email from profiles collection
    let authorRole = "Student";
    let authorEmail = blog.author_email || "";
    try {
      const db = getDB();
      const conditions = [];
      if (blog.author_id) conditions.push({ _id: blog.author_id });
      if (blog.author_email) conditions.push({ email: blog.author_email });

      if (conditions.length > 0) {
        const authorProfile = await db
          .collection("profiles")
          .findOne({ $or: conditions });

        if (authorProfile) {
          if (!authorEmail && authorProfile.email) {
            authorEmail = authorProfile.email;
          }
          if (authorProfile.role === "admin") {
            authorRole = "Administrator";
          } else if (authorProfile.role === "post_holder") {
            authorRole = authorProfile.post_position || "Post Holder";
          } else if (authorProfile.role === "member") {
            authorRole = "Society Member";
          } else {
            authorRole = "Student";
          }
        }
      }
    } catch (profErr) {
      console.warn("Could not fetch author live role:", profErr.message);
    }

    res.json({
      ...blog,
      author_role: authorRole,
      author_email: authorEmail,
    });
  } catch (error) {
    console.error("Get blog by ID error:", error);
    res.status(500).json({ error: "Failed to get blog" });
  }
}

// POST /api/blogs — authenticated user submits blog (status = pending)
export async function createBlog(req, res) {
  try {
    const {
      title,
      description,
      content,
      category,
      tags,
      image,
      cloudinaryPublicId,
      cloudinary_public_id,
      links,
      author: inputAuthor,
    } = req.body;
    const authorId = req.user.userId;
    const authorEmail = req.user.email;

    if (!title || !content || !category) {
      return res
        .status(400)
        .json({ error: "Title, content, and category are required" });
    }

    // Lookup real profile name for the author, fallback to inputAuthor or email
    let authorName = inputAuthor || authorEmail;
    try {
      const db = getDB();
      const userProfile = await db
        .collection("profiles")
        .findOne({ _id: authorId });
      if (userProfile?.name && userProfile.name.trim()) {
        authorName = userProfile.name.trim();
      }
    } catch (dbErr) {
      console.warn("Could not fetch author profile name:", dbErr.message);
    }

    // Calculate reading time based on technical/research content (~120 words per minute)
    const wordCount = (content || "").trim().split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 120));

    // Sanitize tags: support array or comma-separated string, lowercase, no hash symbols
    const rawTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(",")
      : [];
    const sanitizedTags = rawTags
      .map((t) => String(t).replace(/^#/, "").trim().toLowerCase())
      .filter(Boolean);

    const blog = await blogModel.createBlog({
      title: title.trim(),
      description: (description || "").trim(),
      content,
      author: authorName,
      author_id: authorId,
      author_email: authorEmail,
      category: category.trim(),
      tags: sanitizedTags,
      read_time: readTime,
      image: image || "",
      cloudinary_public_id: cloudinary_public_id || cloudinaryPublicId || "",
      links: links || "",
      status: "pending",
      rejection_reason: "",
    });

    res.status(201).json({ message: "Blog submitted for review", blog });
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(500).json({ error: "Failed to create blog" });
  }
}

// PATCH /api/blogs/:id/status — admin only
export async function patchBlogStatus(req, res) {
  try {
    const { status, rejectionReason } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    await blogModel.updateBlogStatus(req.params.id, status, rejectionReason);

    res.json({
      message: `Blog ${status}`,
      status,
      rejection_reason: rejectionReason || "",
    });
  } catch (error) {
    console.error("Update blog status error:", error);
    res.status(500).json({ error: "Failed to update blog status" });
  }
}

// DELETE /api/blogs/:id — admin, post_holder, or author only
export async function deleteBlog(req, res) {
  try {
    const blog = await blogModel.getBlogById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Authorization check: admin, post_holder, or original author
    const isPrivileged =
      req.user.role === "admin" || req.user.role === "post_holder";
    const isAuthor = blog.author_id === req.user.userId;

    if (!isPrivileged && !isAuthor) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this blog" });
    }

    // If blog has an image on Cloudinary, delete it from Cloudinary
    if (blog.cloudinary_public_id) {
      try {
        await cloudinary.v2.uploader.destroy(blog.cloudinary_public_id);
      } catch (cErr) {
        console.warn(
          `Failed to destroy Cloudinary image ${blog.cloudinary_public_id}:`,
          cErr.message
        );
      }
    }

    await blogModel.deleteBlog(req.params.id);
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ error: "Failed to delete blog" });
  }
}

// GET /api/blogs/user/:userId — get user's blogs
export async function getUserBlogs(req, res) {
  try {
    const blogs = await blogModel.getBlogsByAuthor(
      req.params.userId,
      req.user?.email
    );
    res.json(blogs);
  } catch (error) {
    console.error("Get user blogs error:", error);
    res.status(500).json({ error: "Failed to get user blogs" });
  }
}

