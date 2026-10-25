import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { BLOG_CATEGORIES, SUGGESTED_TAGS } from "../utils/blogCategories";
import MarkdownRenderer from "../components/blog/MarkdownRenderer";

function ToolbarBtn({ label, onInsert, title }) {
  return (
    <button
      type="button"
      onClick={onInsert}
      title={title || label}
      style={{
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        background: "rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.65)",
        border: "1px solid rgba(255,255,255,0.08)",
        fontFamily: "monospace",
        userSelect: "none",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.12)";
        e.currentTarget.style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        e.currentTarget.style.color = "rgba(255,255,255,0.65)";
      }}
    >
      {label}
    </button>
  );
}

export default function WriteBlogPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const fileRef = useRef(null);
  const contentRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    content: "",
    links: "",
  });

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [editorMode, setEditorMode] = useState("split"); // "split" | "edit" | "preview"

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [draftSaved, setDraftSaved] = useState(false);

  // Load draft from localStorage on initial render
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("icell_blog_draft");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.form) setForm((prev) => ({ ...prev, ...parsed.form }));
        if (Array.isArray(parsed.tags)) setTags(parsed.tags);
      }
    } catch (e) {
      console.warn("Could not load draft:", e);
    }
  }, []);

  // Auto-save draft on changes (debounce 600ms)
  useEffect(() => {
    if (!form.title && !form.content) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          "icell_blog_draft",
          JSON.stringify({ form, tags, updatedAt: Date.now() })
        );
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      } catch (e) {
        console.warn("Could not save draft:", e);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form, tags]);

  // Handle screen resize: default to tabbed on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 900 && editorMode === "split") {
        setEditorMode("edit");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [editorMode]);

  // Word count & Reading time calculation
  const words = form.content.trim()
    ? form.content.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const readingTime = Math.max(1, Math.ceil(words / 120));

  // Form helpers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Tag helpers
  const addTag = (rawTag) => {
    if (!rawTag) return;
    const clean = rawTag.replace(/^#/, "").trim().toLowerCase();
    if (clean && !tags.includes(clean) && tags.length < 8) {
      setTags((prev) => [...prev, clean]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  // Image handling
  const handleImage = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WebP, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setImageFile(file);
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setError(null);
  };

  const handleFileInput = (e) => handleImage(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleImage(e.dataTransfer.files[0]);
  };

  const CLOUDINARY_CLOUD_NAME = "dpgkl1wq4";
  const CLOUDINARY_UPLOAD_PRESET = "icell-webite-gallery-upload";

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }

    return {
      imageUrl: data.secure_url,
      cloudinaryPublicId: data.public_id,
    };
  };

  const uploadImageAsBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Toolbar actions for markdown
  const insertAt = (before, after = "") => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = ta.value.slice(start, end) || "text";
    const next =
      ta.value.slice(0, start) + before + sel + after + ta.value.slice(end);
    setForm((prev) => ({ ...prev, content: next }));
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(
        start + before.length,
        start + before.length + sel.length
      );
    }, 0);
  };

  const toolbarActions = [
    { label: "H1", fn: () => insertAt("# ") },
    { label: "H2", fn: () => insertAt("## ") },
    { label: "H3", fn: () => insertAt("### ") },
    { label: "B", title: "Bold", fn: () => insertAt("**", "**") },
    { label: "I", title: "Italic", fn: () => insertAt("*", "*") },
    { label: "Quote", title: "Blockquote", fn: () => insertAt("> ") },
    { label: "Link", fn: () => insertAt("[", "](https://)") },
    { label: "• List", fn: () => insertAt("- ") },
    { label: "1. List", fn: () => insertAt("1. ") },
    { label: "Code", fn: () => insertAt("`", "`") },
    { label: "CodeBlock", fn: () => insertAt("```js\n", "\n```") },
    { label: "---", fn: () => insertAt("\n---\n") },
  ];

  // Submit
  const handleSubmit = async () => {
    setError(null);

    if (!form.title.trim() || !form.category || !form.content.trim()) {
      setError("Please fill in all required fields (Title, Category, Content).");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("You must be logged in to submit a blog. Please log in first.");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;
      let cloudinaryPublicId = null;

      if (imageFile) {
        setImageUploading(true);
        try {
          const uploadRes = await uploadToCloudinary(imageFile);
          imageUrl = uploadRes.imageUrl;
          cloudinaryPublicId = uploadRes.cloudinaryPublicId;
        } catch (cloudErr) {
          console.warn(
            "Cloudinary upload failed, falling back to base64:",
            cloudErr
          );
          imageUrl = await uploadImageAsBase64(imageFile);
        } finally {
          setImageUploading(false);
        }
      }

      // Backend resolves author name directly from authenticated profile
      const payload = {
        title: form.title.trim(),
        category: form.category.trim(),
        description: form.description.trim() || "",
        content: form.content,
        tags: tags,
        links: form.links.trim() || "",
        image: imageUrl,
        cloudinary_public_id: cloudinaryPublicId,
      };

      await api.post("/blogs", payload);

      // Clean saved draft upon success
      try {
        localStorage.removeItem("icell_blog_draft");
      } catch (e) {
        console.warn(e);
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "border 0.2s",
  };

  const labelStyle = {
    display: "block",
    color: "rgba(255,255,255,0.6)",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "8px",
    fontFamily: "'DM Sans', sans-serif",
  };

  const focusBorder = {
    onFocus: (e) =>
      (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.3)"),
    onBlur: (e) =>
      (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)"),
  };

  // Success screen
  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d0d0d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <div style={{ textAlign: "center", maxWidth: 480, padding: "0 24px" }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 32,
              color: "#10b981",
            }}
          >
            ✓
          </div>
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 30,
              color: "#fff",
              marginBottom: 12,
            }}
          >
            Blog Submitted for Review!
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 14,
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            Your article has been submitted to the editorial queue. You can track
            its review status directly from your profile page under "My Blogs".
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={() => navigate("/blogs")}
              style={{
                padding: "12px 24px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              ← Browse Blogs
            </button>
            <button
              onClick={() => {
                if (user?.role === "admin" || user?.role === "post_holder")
                  navigate("/admin/profile");
                else navigate("/profile");
              }}
              style={{
                padding: "12px 24px",
                borderRadius: "999px",
                border: "none",
                background: "#6366f1",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              View My Blogs →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form View
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d0d",
        fontFamily: "'DM Sans', sans-serif",
        color: "#fff",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          maxWidth: editorMode === "split" ? "1300px" : "880px",
          margin: "0 auto",
          padding: "110px 24px 80px",
          transition: "max-width 0.3s ease",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
          <button
            onClick={() => navigate("/blogs")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
              fontSize: "12px",
              cursor: "pointer",
              marginBottom: "20px",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Back to Blogs
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#818cf8",
                  marginBottom: "12px",
                }}
              >
                Creator Studio
              </div>
              <h1
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "clamp(28px, 4vw, 42px)",
                  fontWeight: 400,
                  color: "#fff",
                  margin: "0 0 8px",
                  letterSpacing: "-0.02em",
                }}
              >
                Write an Article
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Craft insights on technology, entrepreneurship, and innovations.
              </p>
            </div>

            {/* Author resolver pill & Draft badge */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                </div>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>Author:</span>
                <span style={{ color: "#fff", fontWeight: 500 }}>
                  {user?.name || user?.email || "Authenticated User"}
                </span>
              </div>

              {draftSaved && (
                <span style={{ fontSize: "11px", color: "rgba(16,185,129,0.8)" }}>
                  ✓ Draft saved locally
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "12px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              marginBottom: "24px",
              color: "#ef4444",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <div
          style={{
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            padding: "clamp(20px, 4vw, 36px)",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          {/* Cover Image */}
          <div>
            <label style={labelStyle}>Cover Image (Optional)</label>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              style={{
                borderRadius: "14px",
                border: `1.5px dashed ${
                  dragging ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.12)"
                }`,
                background: dragging
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.02)",
                cursor: "pointer",
                overflow: "hidden",
                transition: "all 0.2s",
                minHeight: imagePreview ? "auto" : "150px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Cover Preview"
                    style={{
                      width: "100%",
                      maxHeight: "280px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                  {imageUploading && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "12px",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          border: "3px solid rgba(255,255,255,0.2)",
                          borderTop: "3px solid #fff",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      <span style={{ color: "#fff", fontSize: "13px" }}>
                        Uploading cover…
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "36px 20px" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>🖼️</div>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "14px",
                      margin: "0 0 4px",
                    }}
                  >
                    Drag & drop or click to choose cover image
                  </p>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.25)",
                      fontSize: "12px",
                      margin: 0,
                    }}
                  >
                    PNG, JPG, WebP up to 5MB
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileInput}
            />
            {imagePreview && !imageUploading && (
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "#ef4444",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ✕ Remove image
              </button>
            )}
          </div>

          {/* Title & Category Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            <div>
              <label style={labelStyle}>
                Title <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Next-Gen AI Applications in Modern Startups"
                style={inputStyle}
                {...focusBorder}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Category <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                {...focusBorder}
              >
                <option value="" style={{ background: "#1a1a1a" }}>
                  Select Category
                </option>
                {BLOG_CATEGORIES.map((c) => (
                  <option key={c} value={c} style={{ background: "#1a1a1a" }}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Tags ({tags.length}/8)
              </label>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                Press Enter or Comma to add
              </span>
            </div>

            <div
              style={{
                ...inputStyle,
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                alignItems: "center",
                padding: "8px 12px",
                minHeight: "46px",
              }}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(99,102,241,0.18)",
                    border: "1px solid rgba(99,102,241,0.35)",
                    color: "#a5b4fc",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#a5b4fc",
                      cursor: "pointer",
                      fontSize: "13px",
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => addTag(tagInput)}
                placeholder={
                  tags.length === 0 ? "Type tag e.g. AI, WebDev..." : "Add more..."
                }
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: "13px",
                  flex: 1,
                  minWidth: "120px",
                  padding: "4px 0",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>

            {/* Suggested Tags pills */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginTop: "10px",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
                Suggestions:
              </span>
              {SUGGESTED_TAGS.map((st) => {
                const isSelected = tags.includes(st.toLowerCase());
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() =>
                      isSelected ? removeTag(st.toLowerCase()) : addTag(st)
                    }
                    style={{
                      padding: "2px 8px",
                      borderRadius: "6px",
                      border: isSelected
                        ? "1px solid #6366f1"
                        : "1px solid rgba(255,255,255,0.08)",
                      background: isSelected
                        ? "rgba(99,102,241,0.25)"
                        : "rgba(255,255,255,0.03)",
                      color: isSelected ? "#c7d2fe" : "rgba(255,255,255,0.5)",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "all 0.15s ease",
                    }}
                  >
                    #{st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label style={labelStyle}>Short Summary / Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="A captivating summary that appears on cards and previews (2–3 sentences)..."
              rows={2}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              {...focusBorder}
            />
          </div>

          {/* Full Content with Live Split / Tabbed Editor */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Content (Markdown) <span style={{ color: "#ef4444" }}>*</span>
              </label>

              {/* View mode switcher */}
              <div
                style={{
                  display: "inline-flex",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "2px",
                  gap: "2px",
                }}
              >
                {[
                  { id: "edit", label: "Edit" },
                  { id: "split", label: "Split View" },
                  { id: "preview", label: "Preview" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setEditorMode(mode.id)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      border: "none",
                      background:
                        editorMode === mode.id
                          ? "rgba(255,255,255,0.15)"
                          : "transparent",
                      color: editorMode === mode.id ? "#fff" : "rgba(255,255,255,0.5)",
                      transition: "all 0.15s",
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Box */}
            <div
              style={{
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                overflow: "hidden",
              }}
            >
              {/* Toolbar */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  padding: "8px 12px",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  flexWrap: "wrap",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                {toolbarActions.map((action) => (
                  <ToolbarBtn
                    key={action.label}
                    label={action.label}
                    title={action.title}
                    onInsert={action.fn}
                  />
                ))}

                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  <span>{words} words</span>
                  <span
                    style={{
                      color: "#38bdf8",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    🕒 {readingTime} min read
                  </span>
                </div>
              </div>

              {/* Main Editing / Preview Container */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    editorMode === "split"
                      ? "1fr 1fr"
                      : "1fr",
                  minHeight: "420px",
                }}
              >
                {/* Left/Main Editor Textarea */}
                {(editorMode === "edit" || editorMode === "split") && (
                  <textarea
                    ref={contentRef}
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    placeholder={`# Your Compelling Blog Title\n\nWrite an engaging intro paragraph...\n\n## Key Insights\n\n- Point 1\n- Point 2\n\n> "A meaningful quote that adds value."\n\n\`\`\`js\n// Code snippet if applicable\nconsole.log("Hello, NIT KKR!");\n\`\`\`\n\n## Conclusion\n\nWrap up your thoughts.`}
                    rows={18}
                    style={{
                      ...inputStyle,
                      border: "none",
                      borderRadius: 0,
                      background: "transparent",
                      resize: "none",
                      lineHeight: 1.8,
                      fontFamily: "Consolas, Monaco, monospace",
                      fontSize: "13.5px",
                      padding: "16px",
                      borderRight:
                        editorMode === "split"
                          ? "1px solid rgba(255,255,255,0.07)"
                          : "none",
                    }}
                  />
                )}

                {/* Right/Preview Pane */}
                {(editorMode === "preview" || editorMode === "split") && (
                  <div
                    style={{
                      padding: "20px 24px",
                      overflowY: "auto",
                      maxHeight: "600px",
                      background:
                        editorMode === "split"
                          ? "rgba(0,0,0,0.2)"
                          : "transparent",
                    }}
                  >
                    {form.content.trim() ? (
                      <MarkdownRenderer content={form.content} />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "rgba(255,255,255,0.25)",
                          fontSize: "13px",
                          fontStyle: "italic",
                          minHeight: "200px",
                        }}
                      >
                        Markdown preview will render here in real-time...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div>
            <label style={labelStyle}>Reference Links (Optional)</label>
            <input
              name="links"
              value={form.links}
              onChange={handleChange}
              placeholder="https://github.com/..., https://arxiv.org/..."
              style={inputStyle}
              {...focusBorder}
            />
            <p
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: "11px",
                marginTop: "6px",
                marginRight: 0,
                marginBottom: 0,
                marginLeft: 0,
              }}
            >
              Separate multiple URLs with commas.
            </p>
          </div>

          {/* Submission Banner */}
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "12px",
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.18)",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>🛡️</span>
            <div>
              <p
                style={{
                  color: "#c7d2fe",
                  fontSize: "13px",
                  margin: 0,
                  lineHeight: 1.5,
                  fontWeight: 500,
                }}
              >
                Editorial Workflow & Review
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "12px",
                  margin: "4px 0 0",
                  lineHeight: 1.5,
                }}
              >
                Articles are reviewed by administrators or post holders before
                publication. You will receive constructive feedback directly if any
                adjustments are required.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to discard your draft? This will clear all fields."
                  )
                ) {
                  localStorage.removeItem("icell_blog_draft");
                  setForm({
                    title: "",
                    category: "",
                    description: "",
                    content: "",
                    links: "",
                  });
                  setTags([]);
                  setImagePreview(null);
                  setImageFile(null);
                }
              }}
              style={{
                padding: "10px 18px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent",
                color: "rgba(255,255,255,0.35)",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Clear Draft
            </button>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => navigate("/blogs")}
                style={{
                  padding: "12px 24px",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || imageUploading}
                style={{
                  padding: "12px 34px",
                  borderRadius: "999px",
                  border: "none",
                  background:
                    loading || imageUploading
                      ? "rgba(99,102,241,0.4)"
                      : "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: loading || imageUploading ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: "0 4px 18px rgba(99,102,241,0.35)",
                  transition: "all 0.25s ease",
                }}
              >
                {loading
                  ? "Submitting..."
                  : imageUploading
                  ? "Uploading image..."
                  : "Submit for Review →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
