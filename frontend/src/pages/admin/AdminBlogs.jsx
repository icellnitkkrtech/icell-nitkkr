import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";
import { Trash2, AlertTriangle, Loader2, MessageSquare, Clock } from "lucide-react";
import { getOptimizedCloudinaryUrl, CLOUDINARY_PRESETS } from "../../utils/cloudinary";
import { BLOG_CATEGORIES } from "../../utils/blogCategories";
import MarkdownRenderer from "../../components/blog/MarkdownRenderer";

const categories = ["All", ...BLOG_CATEGORIES];
const statuses = ["All", "Pending", "Approved", "Rejected"];

const statusStyle = {
  pending: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", label: "Pending" },
  approved: {
    bg: "rgba(16,185,129,0.12)",
    color: "#10b981",
    label: "Approved",
  },
  rejected: { bg: "rgba(239,68,68,0.12)", color: "#ef4444", label: "Rejected" },
};



export default function AdminBlogs() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirmBlog, setDeleteConfirmBlog] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [rejectDialogBlog, setRejectDialogBlog] = useState(null);
  const [rejectionFeedback, setRejectionFeedback] = useState("");

  // Check admin/post_holder access
  useEffect(() => {
    if (
      !authLoading &&
      (!user || (user.role !== "admin" && user.role !== "post_holder"))
    ) {
      navigate("/");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await api.get("/blogs/admin/all");
        setBlogs(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // ── Update status via API ─────────────────────────────────────────────────
  const updateStatus = async (id, newStatus, rejectionReason = "") => {
    if (!id) return;
    setActionLoading(true);
    try {
      await api.patch(`/blogs/${id}/status`, {
        status: newStatus,
        rejectionReason: rejectionReason || "",
      });

      // Optimistically update local state
      setBlogs((prev) =>
        prev.map((b) =>
          (b._id || b.id) === id
            ? {
                ...b,
                status: newStatus,
                rejection_reason:
                  newStatus === "rejected"
                    ? rejectionReason || b.rejection_reason || ""
                    : "",
              }
            : b
        )
      );
      if ((preview?._id || preview?.id) === id) {
        setPreview((p) =>
          p
            ? {
                ...p,
                status: newStatus,
                rejection_reason:
                  newStatus === "rejected"
                    ? rejectionReason || p.rejection_reason || ""
                    : "",
              }
            : null
        );
      }
      setRejectDialogBlog(null);
      setRejectionFeedback("");
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  };


  // ── Delete blog via API ───────────────────────────────────────────────────
  const handleDeleteBlog = async (id) => {
    if (!id) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/blogs/${id}`);
      setBlogs((prev) => prev.filter((b) => (b._id || b.id) !== id));
      if ((preview?._id || preview?.id) === id) {
        setPreview(null);
      }
      setDeleteConfirmBlog(null);
    } catch (err) {
      alert("Failed to delete blog: " + (err.response?.data?.error || err.message));
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = blogs.filter((b) => {
    const matchStatus =
      filterStatus === "All" || b.status === filterStatus.toLowerCase();
    const matchCat = filterCategory === "All" || b.category === filterCategory;
    const matchSearch =
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchCat && matchSearch;
  });

  const stats = [
    { label: "Total", value: blogs.length, color: "#a855f7" },
    {
      label: "Pending",
      value: blogs.filter((b) => b.status === "pending").length,
      color: "#f59e0b",
    },
    {
      label: "Approved",
      value: blogs.filter((b) => b.status === "approved").length,
      color: "#10b981",
    },
    {
      label: "Rejected",
      value: blogs.filter((b) => b.status === "rejected").length,
      color: "#ef4444",
    },
  ];

  return (
    <div
      className="flex h-screen bg-[#0d0d0d]"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 overflow-auto">
        <div
          className="max-lg:pt-20"
          style={{
            padding: "32px",
            minHeight: "100vh",
            background: "#0d0d0d",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          <link
            href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />

          {/* Header */}
          <div style={{ marginBottom: "28px" }}>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#fff",
                margin: 0,
              }}
            >
              Blog Management
            </h1>
            <p style={{ color: "#555", fontSize: "13px", marginTop: "4px" }}>
              Review and approve blog submissions from students and contributors
            </p>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "24px",
              flexWrap: "wrap",
            }}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  background: "#111",
                  border: "1px solid #1f1f1f",
                }}
              >
                <span
                  style={{ fontSize: "20px", fontWeight: 700, color: s.color }}
                >
                  {s.value}
                </span>
                <span style={{ color: "#666", fontSize: "13px" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "24px",
            }}
          >
            <input
              type="text"
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: "1",
                minWidth: "180px",
                padding: "8px 14px",
                borderRadius: "10px",
                background: "#111",
                border: "1px solid #1f1f1f",
                color: "#fff",
                fontSize: "13px",
                outline: "none",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            />
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "'Space Grotesk', sans-serif",
                    background:
                      filterStatus === s ? "rgba(168,85,247,0.15)" : "#111",
                    color: filterStatus === s ? "#a855f7" : "#666",
                    border: `1px solid ${
                      filterStatus === s ? "rgba(168,85,247,0.3)" : "#1f1f1f"
                    }`,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCategory(c)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "'Space Grotesk', sans-serif",
                    background:
                      filterCategory === c ? "rgba(99,102,241,0.15)" : "#111",
                    color: filterCategory === c ? "#6366f1" : "#666",
                    border: `1px solid ${
                      filterCategory === c ? "rgba(99,102,241,0.3)" : "#1f1f1f"
                    }`,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <p
              style={{ color: "#555", textAlign: "center", paddingTop: "60px" }}
            >
              Loading blogs…
            </p>
          )}

          {/* Blog Cards */}
          {!loading && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {filtered.map((blog) => {
                const st = statusStyle[blog.status] || statusStyle.pending;
                return (
                  <div
                    key={blog._id}
                    onClick={() => setPreview(blog)}
                    style={{
                      background: "#111",
                      borderRadius: "14px",
                      border: "1px solid #1f1f1f",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "border-color 0.2s, transform 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#2a2a2a";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#1f1f1f";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Image — handle base64 or URL */}
                    <div style={{ position: "relative" }}>
                      {blog.image ? (
                        <img
                          src={
                            getOptimizedCloudinaryUrl(
                              blog.image,
                              CLOUDINARY_PRESETS.thumbnail
                            ) || blog.image
                          }
                          alt={blog.title}
                          style={{
                            width: "100%",
                            height: "140px",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "140px",
                            background: "#1a1a1a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "32px",
                          }}
                        >
                          📝
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "14px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            background: "rgba(99,102,241,0.12)",
                            color: "#6366f1",
                          }}
                        >
                          {blog.category}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            fontWeight: 600,
                            background: st.bg,
                            color: st.color,
                          }}
                        >
                          {st.label}
                        </span>
                      </div>
                      <h3
                        style={{
                          color: "#fff",
                          fontSize: "14px",
                          fontWeight: 600,
                          margin: "0 0 4px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {blog.title}
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#777",
                          fontSize: "11px",
                          margin: "0 0 6px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>by {blog.author}{blog.author_email ? ` (${blog.author_email})` : ""}</span>
                        <span>·</span>
                        <span>{blog.date}</span>
                        <span>·</span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                            color: "#38bdf8",
                          }}
                        >
                          <Clock size={11} />
                          {blog.read_time || Math.max(1, Math.ceil((blog.content || "").split(/\s+/).filter(Boolean).length / 120))} min read
                        </span>
                      </div>

                      {/* Tags chips */}
                      {blog.tags && blog.tags.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "4px",
                            marginBottom: "8px",
                          }}
                        >
                          {blog.tags.slice(0, 3).map((tag, ti) => (
                            <span
                              key={ti}
                              style={{
                                fontSize: "10px",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                background: "rgba(99,102,241,0.1)",
                                color: "#a5b4fc",
                                border: "1px solid rgba(99,102,241,0.2)",
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <p
                        style={{
                          color: "#666",
                          fontSize: "12px",
                          margin: "0 0 10px",
                          lineHeight: 1.6,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {blog.description}
                      </p>

                      {/* Rejection Feedback Note if present */}
                      {blog.status === "rejected" && blog.rejection_reason && (
                        <div
                          style={{
                            marginBottom: "12px",
                            padding: "6px 10px",
                            borderRadius: "8px",
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            fontSize: "11px",
                            color: "#fca5a5",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "6px",
                          }}
                        >
                          <MessageSquare size={12} style={{ flexShrink: 0, marginTop: "2px" }} />
                          <span style={{ lineHeight: 1.4 }}>
                            <strong>Feedback:</strong> {blog.rejection_reason}
                          </span>
                        </div>
                      )}

                      <div
                        style={{ display: "flex", gap: "6px", alignItems: "center" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setPreview(blog)}
                          style={{
                            flex: 1,
                            padding: "7px 0",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "'Space Grotesk', sans-serif",
                            background: "#1a1a1a",
                            color: "#888",
                            border: "1px solid #2a2a2a",
                          }}
                        >
                          Read
                        </button>
                        {blog.status !== "approved" && (
                          <button
                            onClick={() => updateStatus(blog._id || blog.id, "approved")}
                            disabled={actionLoading}
                            style={{
                              flex: 1,
                              padding: "7px 0",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 500,
                              cursor: "pointer",
                              fontFamily: "'Space Grotesk', sans-serif",
                              background: "rgba(16,185,129,0.12)",
                              color: "#10b981",
                              border: "none",
                            }}
                          >
                            Approve
                          </button>
                        )}
                        {blog.status !== "rejected" ? (
                          <button
                            onClick={() => {
                              setRejectDialogBlog(blog);
                              setRejectionFeedback(blog.rejection_reason || "");
                            }}
                            disabled={actionLoading}
                            style={{
                              flex: 1,
                              padding: "7px 0",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 500,
                              cursor: "pointer",
                              fontFamily: "'Space Grotesk', sans-serif",
                              background: "rgba(239,68,68,0.12)",
                              color: "#ef4444",
                              border: "none",
                            }}
                          >
                            Reject
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setRejectDialogBlog(blog);
                              setRejectionFeedback(blog.rejection_reason || "");
                            }}
                            disabled={actionLoading}
                            style={{
                              padding: "7px 10px",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontWeight: 500,
                              cursor: "pointer",
                              fontFamily: "'Space Grotesk', sans-serif",
                              background: "rgba(239,68,68,0.08)",
                              color: "#fca5a5",
                              border: "1px solid rgba(239,68,68,0.2)",
                            }}
                            title="Edit Rejection Feedback"
                          >
                            Edit Note
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirmBlog(blog)}
                          title="Delete Blog"
                          style={{
                            padding: "7px 10px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            cursor: "pointer",
                            background: "rgba(239,68,68,0.1)",
                            color: "#ef4444",
                            border: "1px solid rgba(239,68,68,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", paddingTop: "80px" }}>
              <p style={{ fontSize: "48px", marginBottom: "12px" }}>📝</p>
              <p style={{ color: "#444", fontSize: "14px" }}>
                No blogs match your filters
              </p>
            </div>
          )}

          {/* Preview Modal — same structure as your existing one */}
          {preview && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
                background: "rgba(0,0,0,0.85)",
                backdropFilter: "blur(6px)",
              }}
              onClick={() => setPreview(null)}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "680px",
                  maxHeight: "90vh",
                  borderRadius: "20px",
                  overflow: "hidden",
                  background: "#111",
                  border: "1px solid #2a2a2a",
                  display: "flex",
                  flexDirection: "column",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal image */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {preview.image ? (
                    <img
                      src={
                        getOptimizedCloudinaryUrl(
                          preview.image,
                          CLOUDINARY_PRESETS.carousel
                        ) || preview.image
                      }
                      alt={preview.title}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "120px",
                        background: "#1a1a1a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "40px",
                      }}
                    >
                      📝
                    </div>
                  )}
                  <button
                    onClick={() => setPreview(null)}
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.6)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontSize: "16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ×
                  </button>
                  <span
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "14px",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontWeight: 600,
                      background: statusStyle[preview.status]?.bg,
                      color: statusStyle[preview.status]?.color,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {statusStyle[preview.status]?.label}
                  </span>
                </div>

                {/* Content */}
                <div
                  style={{ overflowY: "auto", flex: 1, padding: "24px 28px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      alignItems: "center",
                      marginBottom: "14px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        background: "rgba(99,102,241,0.12)",
                        color: "#6366f1",
                        fontWeight: 600,
                      }}
                    >
                      {preview.category}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        color: "#38bdf8",
                        background: "rgba(56,189,248,0.1)",
                        padding: "3px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      <Clock size={11} />
                      {preview.read_time || Math.max(1, Math.ceil((preview.content || "").split(/\s+/).filter(Boolean).length / 120))} min read
                    </span>
                    {preview.tags && preview.tags.length > 0 && (
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {preview.tags.map((t, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: "11px",
                              color: "#a5b4fc",
                              background: "rgba(99,102,241,0.08)",
                              padding: "2px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <h2
                    style={{
                      color: "#fff",
                      fontSize: "22px",
                      fontWeight: 700,
                      margin: "0 0 6px",
                      lineHeight: 1.3,
                    }}
                  >
                    {preview.title}
                  </h2>
                  <p
                    style={{
                      color: "#555",
                      fontSize: "13px",
                      margin: "0 0 16px",
                    }}
                  >
                    by {preview.author}{preview.author_email ? ` (${preview.author_email})` : ""} · {preview.date}
                  </p>

                  {/* Rejection Note alert if rejected */}
                  {preview.status === "rejected" && preview.rejection_reason && (
                    <div
                      style={{
                        marginBottom: "20px",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.25)",
                        color: "#fca5a5",
                        fontSize: "13px",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "#ef4444",
                        }}
                      >
                        <MessageSquare size={14} /> Rejection / Revision Note to Author:
                      </p>
                      <p style={{ margin: 0, color: "#fecaca", lineHeight: 1.5 }}>
                        {preview.rejection_reason}
                      </p>
                    </div>
                  )}

                  <p
                    style={{
                      color: "#888",
                      fontSize: "14px",
                      lineHeight: 1.7,
                      margin: "0 0 24px",
                      fontStyle: "italic",
                      borderLeft: "3px solid #2a2a2a",
                      paddingLeft: "14px",
                    }}
                  >
                    {preview.description}
                  </p>
                  <div
                    style={{
                      height: "1px",
                      background: "#1f1f1f",
                      margin: "0 0 24px",
                    }}
                  />
                  <MarkdownRenderer content={preview.content} />
                  {preview.links && (
                    <div
                      style={{
                        marginTop: "24px",
                        padding: "14px 16px",
                        borderRadius: "12px",
                        background: "#161616",
                        border: "1px solid #222",
                      }}
                    >
                      <p
                        style={{
                          color: "#555",
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          margin: "0 0 8px",
                        }}
                      >
                        Related Links
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {preview.links.split(",").map((link, i) => (
                          <a
                            key={i}
                            href={link.trim()}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: "12px",
                              color: "#6366f1",
                              textDecoration: "none",
                              padding: "3px 10px",
                              borderRadius: "6px",
                              background: "rgba(99,102,241,0.08)",
                              border: "1px solid rgba(99,102,241,0.2)",
                            }}
                          >
                            🔗 {link.trim()}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action bar */}
                <div
                  style={{
                    padding: "16px 24px",
                    borderTop: "1px solid #1f1f1f",
                    display: "flex",
                    gap: "10px",
                    flexShrink: 0,
                    background: "#0f0f0f",
                    alignItems: "center",
                  }}
                >
                  {preview.status !== "approved" ? (
                    <button
                      onClick={() => updateStatus(preview._id || preview.id, "approved")}
                      disabled={actionLoading}
                      style={{
                        flex: 1,
                        padding: "11px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'Space Grotesk', sans-serif",
                        border: "none",
                        background: "rgba(16,185,129,0.15)",
                        color: "#10b981",
                      }}
                    >
                      ✓ Approve Blog
                    </button>
                  ) : (
                    <div
                      style={{
                        flex: 1,
                        padding: "11px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 600,
                        background: "rgba(16,185,129,0.08)",
                        color: "#10b981",
                        textAlign: "center",
                        border: "1px solid rgba(16,185,129,0.2)",
                      }}
                    >
                      ✓ Already Approved
                    </div>
                  )}
                  {preview.status !== "rejected" ? (
                    <button
                      onClick={() => {
                        setRejectDialogBlog(preview);
                        setRejectionFeedback(preview.rejection_reason || "");
                      }}
                      disabled={actionLoading}
                      style={{
                        flex: 1,
                        padding: "11px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'Space Grotesk', sans-serif",
                        border: "none",
                        background: "rgba(239,68,68,0.15)",
                        color: "#ef4444",
                      }}
                    >
                      ✗ Reject Blog
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setRejectDialogBlog(preview);
                        setRejectionFeedback(preview.rejection_reason || "");
                      }}
                      disabled={actionLoading}
                      style={{
                        flex: 1,
                        padding: "11px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'Space Grotesk', sans-serif",
                        border: "1px solid rgba(239,68,68,0.25)",
                        background: "rgba(239,68,68,0.08)",
                        color: "#fca5a5",
                        textAlign: "center",
                      }}
                    >
                      💬 Edit Rejection Note
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirmBlog(preview)}
                    style={{
                      padding: "11px 18px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'Space Grotesk', sans-serif",
                      border: "1px solid rgba(239,68,68,0.3)",
                      background: "rgba(239,68,68,0.12)",
                      color: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={() => setPreview(null)}
                    style={{
                      padding: "11px 20px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontFamily: "'Space Grotesk', sans-serif",
                      background: "#1a1a1a",
                      color: "#666",
                      border: "1px solid #2a2a2a",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmBlog && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
                background: "rgba(0,0,0,0.85)",
                backdropFilter: "blur(6px)",
              }}
              onClick={() => !deleteLoading && setDeleteConfirmBlog(null)}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "440px",
                  borderRadius: "16px",
                  background: "#111",
                  border: "1px solid #1f1f1f",
                  padding: "24px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ef4444",
                      flexShrink: 0,
                    }}
                  >
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <h3
                      style={{
                        color: "#fff",
                        fontSize: "18px",
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      Delete Blog
                    </h3>
                    <p
                      style={{
                        color: "#777",
                        fontSize: "13px",
                        margin: "2px 0 0",
                      }}
                    >
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                <p
                  style={{
                    color: "#aaa",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    marginBottom: "20px",
                  }}
                >
                  Are you sure you want to permanently delete{" "}
                  <span style={{ color: "#fff", fontWeight: 600 }}>
                    "{deleteConfirmBlog.title}"
                  </span>
                  ?
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => setDeleteConfirmBlog(null)}
                    disabled={deleteLoading}
                    style={{
                      padding: "9px 18px",
                      borderRadius: "8px",
                      background: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      color: "#aaa",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteBlog(
                        deleteConfirmBlog._id || deleteConfirmBlog.id
                      )
                    }
                    disabled={deleteLoading}
                    style={{
                      padding: "9px 20px",
                      borderRadius: "8px",
                      background: "#ef4444",
                      border: "none",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {deleteLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        <span>Delete Permanently</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Feedback Modal */}
          {rejectDialogBlog && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
                background: "rgba(0,0,0,0.85)",
                backdropFilter: "blur(6px)",
              }}
              onClick={() => !actionLoading && setRejectDialogBlog(null)}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "480px",
                  borderRadius: "16px",
                  background: "#111",
                  border: "1px solid #1f1f1f",
                  padding: "24px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.8)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ef4444",
                      flexShrink: 0,
                    }}
                  >
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <h3
                      style={{
                        color: "#fff",
                        fontSize: "18px",
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      Rejection & Revision Note
                    </h3>
                    <p
                      style={{
                        color: "#777",
                        fontSize: "13px",
                        margin: "2px 0 0",
                      }}
                    >
                      Provide feedback to the author on what needs revision.
                    </p>
                  </div>
                </div>

                <p
                  style={{
                    color: "#aaa",
                    fontSize: "13.5px",
                    lineHeight: 1.5,
                    marginBottom: "14px",
                  }}
                >
                  Article:{" "}
                  <span style={{ color: "#fff", fontWeight: 600 }}>
                    "{rejectDialogBlog.title}"
                  </span>{" "}
                  by {rejectDialogBlog.author}
                </p>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      color: "#888",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "6px",
                    }}
                  >
                    Feedback / Revision Note (Optional)
                  </label>
                  <textarea
                    value={rejectionFeedback}
                    onChange={(e) => setRejectionFeedback(e.target.value)}
                    placeholder="e.g. Great topic! Please elaborate on section 2 with concrete examples and clean up the headings before resubmitting."
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid #2a2a2a",
                      color: "#fff",
                      fontSize: "13px",
                      fontFamily: "'Space Grotesk', sans-serif",
                      outline: "none",
                      boxSizing: "border-box",
                      resize: "vertical",
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => setRejectDialogBlog(null)}
                    disabled={actionLoading}
                    style={{
                      padding: "9px 18px",
                      borderRadius: "8px",
                      background: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      color: "#aaa",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      updateStatus(
                        rejectDialogBlog._id || rejectDialogBlog.id,
                        "rejected",
                        rejectionFeedback
                      )
                    }
                    disabled={actionLoading}
                    style={{
                      padding: "9px 20px",
                      borderRadius: "8px",
                      background: "#ef4444",
                      border: "none",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Confirm Rejection</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
