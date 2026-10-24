import { getDB } from "../config/mongodb.js";
import { v4 as uuidv4 } from "uuid";

// Create blog
export async function createBlog(
  titleOrData,
  description,
  content,
  author,
  authorId,
  category,
  image,
  cloudinaryPublicId,
  links
) {
  const db = getDB();
  const blogs = db.collection("blogs");

  let blogData = {};
  if (typeof titleOrData === "object" && titleOrData !== null) {
    blogData = {
      title: titleOrData.title || "",
      description: titleOrData.description || "",
      content: titleOrData.content || "",
      author: titleOrData.author || "",
      author_id: titleOrData.author_id || titleOrData.authorId || "",
      author_email: titleOrData.author_email || titleOrData.authorEmail || "",
      category: titleOrData.category || "General",
      tags: Array.isArray(titleOrData.tags)
        ? titleOrData.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
        : [],
      read_time: Number(titleOrData.read_time) || 1,
      image: titleOrData.image || "",
      cloudinary_public_id:
        titleOrData.cloudinary_public_id || titleOrData.cloudinaryPublicId || "",
      links: titleOrData.links || "",
      status: titleOrData.status || "pending",
      rejection_reason: titleOrData.rejection_reason || "",
    };
  } else {
    blogData = {
      title: titleOrData || "",
      description: description || "",
      content: content || "",
      author: author || "",
      author_id: authorId || "",
      author_email: "",
      category: category || "General",
      tags: [],
      read_time: 1,
      image: image || "",
      cloudinary_public_id: cloudinaryPublicId || "",
      links: links || "",
      status: "pending",
      rejection_reason: "",
    };
  }

  const blog = {
    _id: uuidv4(),
    ...blogData,
    created_at: new Date(),
    updated_at: new Date(),
  };

  await blogs.insertOne(blog);
  return blog;
}

// Get all blogs
export async function getAllBlogs() {
  const db = getDB();
  const blogs = db.collection("blogs");
  return await blogs.find({}).sort({ created_at: -1 }).toArray();
}

// Get blog by ID
export async function getBlogById(id) {
  const db = getDB();
  const blogs = db.collection("blogs");
  return await blogs.findOne({ _id: id });
}

// Get blogs by status
export async function getBlogsByStatus(status, filter = {}) {
  const db = getDB();
  const blogs = db.collection("blogs");

  const query = { status };
  if (filter.category && filter.category !== "All") {
    query.category = filter.category;
  }
  if (filter.tag) {
    query.tags = filter.tag.toLowerCase();
  }

  return await blogs.find(query).sort({ created_at: -1 }).toArray();
}

// Update blog status
export async function updateBlogStatus(blogId, status, rejectionReason = "") {
  const db = getDB();
  const blogs = db.collection("blogs");

  const updateFields = {
    status,
    updated_at: new Date(),
  };

  if (status === "rejected") {
    updateFields.rejection_reason = rejectionReason || "";
  } else if (status === "approved") {
    updateFields.rejection_reason = ""; // Reset rejection note upon approval
  }

  const result = await blogs.updateOne(
    { _id: blogId },
    { $set: updateFields }
  );

  return result.modifiedCount > 0;
}

// Delete blog
export async function deleteBlog(blogId) {
  const db = getDB();
  const blogs = db.collection("blogs");

  const result = await blogs.deleteOne({ _id: blogId });
  return result.deletedCount > 0;
}

// Get blogs by author
export async function getBlogsByAuthor(authorId, authorEmail = "") {
  const db = getDB();
  const blogs = db.collection("blogs");
  const orConditions = [{ author_id: authorId }];
  if (authorEmail) {
    orConditions.push({ author_email: authorEmail });
  }
  return await blogs
    .find({ $or: orConditions })
    .sort({ created_at: -1 })
    .toArray();
}

