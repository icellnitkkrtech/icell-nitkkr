import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import {
  BookOpen,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function UserBlogsSection({ userId }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModalBlog, setDeleteModalBlog] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState("");

  const isPrivileged = user?.role === "admin" || user?.role === "post_holder";

  useEffect(() => {
    if (!userId) return;

    const fetchUserBlogs = async () => {
      try {
        const res = await api.get(`/blogs/user/${userId}`);
        setBlogs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.warn("Could not fetch user blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBlogs();
  }, [userId]);

  const openDeleteModal = (blog) => {
    setDeleteError("");
    setDeleteModalBlog(blog);
  };

  const handleExecuteDelete = async () => {
    if (!deleteModalBlog) return;
    const blogId = deleteModalBlog._id || deleteModalBlog.id;
    setDeletingId(blogId);
    setDeleteError("");
    try {
      await api.delete(`/blogs/${blogId}`);
      setBlogs((prev) => prev.filter((b) => (b._id || b.id) !== blogId));
      const deletedTitle = deleteModalBlog.title;
      setDeleteModalBlog(null);
      setDeleteSuccessMsg(`"${deletedTitle}" deleted successfully.`);
      setTimeout(() => setDeleteSuccessMsg(""), 4000);
    } catch (err) {
      setDeleteError(
        err.response?.data?.error ||
          err.message ||
          "Failed to delete article. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return {
          label: "✓ Published",
          bg: "rgba(16,185,129,0.12)",
          color: "#34d399",
          border: "rgba(16,185,129,0.25)",
        };
      case "rejected":
        return {
          label: "⚠️ Needs Revision",
          bg: "rgba(239,68,68,0.12)",
          color: "#f87171",
          border: "rgba(239,68,68,0.25)",
        };
      default:
        return {
          label: "⏳ Under Review",
          bg: "rgba(245,158,11,0.12)",
          color: "#fbbf24",
          border: "rgba(245,158,11,0.25)",
        };
    }
  };

  return (
    <div
      className="rounded-xl border p-6 w-full"
      style={{ background: "#111111", borderColor: "#1f1f1f" }}
    >
      {/* Success notification banner */}
      {deleteSuccessMsg && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="font-medium">{deleteSuccessMsg}</span>
          </div>
          <button
            onClick={() => setDeleteSuccessMsg("")}
            className="text-emerald-400/60 hover:text-emerald-300 p-0.5 rounded transition-colors"
            title="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-lg"
            style={{ background: "#6366f118" }}
          >
            <BookOpen size={20} style={{ color: "#818cf8" }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">My Articles</h3>
            <p className="text-xs text-[#666]">
              Track your article submissions and review status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPrivileged && (
            <button
              onClick={() => navigate("/admin/blogs")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#1a1a1a] text-[#aaa] hover:text-white hover:bg-[#252525] border border-[#2a2a2a] transition-colors"
            >
              <ExternalLink size={13} />
              <span>Review Queue</span>
            </button>
          )}
          <button
            onClick={() => navigate("/write-blog")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#6366f1] text-white hover:bg-[#4f46e5] transition-colors shadow-sm"
          >
            <Plus size={14} />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8 text-[#666] text-sm">
          Loading your articles...
        </div>
      )}

      {/* Empty state */}
      {!loading && blogs.length === 0 && (
        <div className="text-center py-8 px-4 rounded-lg border border-[#1f1f1f] bg-[#0c0c0c]">
          <BookOpen size={32} className="mx-auto mb-2 text-[#444]" />
          <p className="text-[#888] text-sm font-medium mb-1">
            No articles submitted yet
          </p>
          <p className="text-[#555] text-xs max-w-sm mx-auto mb-4">
            Share your technical projects, startup experiences, or campus
            insights with the student community.
          </p>
          <button
            onClick={() => navigate("/write-blog")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#1f1f1f] text-[#ccc] hover:bg-[#2a2a2a] hover:text-white transition-colors border border-[#333]"
          >
            ✍️ Write Your First Article
          </button>
        </div>
      )}

      {/* Blogs list */}
      {!loading && blogs.length > 0 && (
        <div className="space-y-3.5">
          {blogs.map((blog) => {
            const badge = getStatusBadge(blog.status);
            const blogId = blog._id || blog.id;
            const readTime =
              blog.read_time ||
              Math.max(
                1,
                Math.ceil(
                  (blog.content || "").split(/\s+/).filter(Boolean).length / 120
                )
              );

            return (
              <div
                key={blogId}
                className="rounded-lg p-4 border border-[#222] bg-[#0c0c0c] transition-colors hover:border-[#333]"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {badge.label}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[#18181b] text-[#888] border border-[#27272a]">
                        {blog.category}
                      </span>
                      <span className="text-[11px] text-[#555] flex items-center gap-1">
                        <Clock size={11} /> {readTime} min read
                      </span>
                      {blog.date && (
                        <span className="text-[11px] text-[#555]">
                          · {blog.date}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4
                      onClick={() =>
                        blog.status === "approved" &&
                        navigate(`/blog/${blogId}`)
                      }
                      className={`text-base font-semibold text-white mb-1.5 ${
                        blog.status === "approved"
                          ? "cursor-pointer hover:text-indigo-300 transition-colors"
                          : ""
                      }`}
                    >
                      {blog.title}
                    </h4>

                    {/* Description preview */}
                    {blog.description && (
                      <p className="text-xs text-[#666] line-clamp-2 mb-2">
                        {blog.description}
                      </p>
                    )}

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {blog.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] text-indigo-300 bg-indigo-950/40 border border-indigo-800/30 px-1.5 py-0.5 rounded"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Rejection Feedback Note */}
                    {blog.status === "rejected" && blog.rejection_reason && (
                      <div className="mt-3 p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-red-300 text-xs flex items-start gap-2.5">
                        <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-200 mb-0.5">
                            Admin Revision Feedback:
                          </p>
                          <p className="text-red-300/80 leading-relaxed">
                            {blog.rejection_reason}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 sm:self-center">
                    {blog.status === "approved" && (
                      <button
                        onClick={() => navigate(`/blog/${blogId}`)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#333] text-[#ccc] hover:bg-[#1a1a1a] hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <ExternalLink size={12} />
                        <span>View</span>
                      </button>
                    )}
                    <button
                      onClick={() => openDeleteModal(blog)}
                      disabled={deletingId === blogId}
                      className="p-1.5 rounded-lg text-[#ef4444] hover:bg-red-950/20 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Delete Article"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal UI Box */}
      {deleteModalBlog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !deletingId && setDeleteModalBlog(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 border border-[#262626] bg-[#111111] shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85)" }}
          >
            {/* Close button */}
            <button
              onClick={() => !deletingId && setDeleteModalBlog(null)}
              disabled={Boolean(deletingId)}
              className="absolute top-4 right-4 text-[#777] hover:text-white p-1 rounded-lg hover:bg-[#1f1f1f] transition-colors disabled:opacity-40"
              title="Close"
            >
              <X size={18} />
            </button>

            {/* Header with Alert Icon */}
            <div className="flex items-start gap-3.5 mb-4">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">
                  Delete Article Submission
                </h4>
                <p className="text-xs text-[#777] mt-0.5">
                  Are you sure you want to remove this submission?
                </p>
              </div>
            </div>

            {/* Article Preview Card */}
            <div className="rounded-xl p-3.5 bg-[#161616] border border-[#242424] mb-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{
                    background: getStatusBadge(deleteModalBlog.status).bg,
                    color: getStatusBadge(deleteModalBlog.status).color,
                    border: `1px solid ${getStatusBadge(deleteModalBlog.status).border}`,
                  }}
                >
                  {getStatusBadge(deleteModalBlog.status).label}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#202020] text-[#999] border border-[#2e2e2e]">
                  {deleteModalBlog.category}
                </span>
              </div>
              <p className="text-sm font-semibold text-white line-clamp-2 mb-1">
                {deleteModalBlog.title}
              </p>
              <p className="text-[11px] text-[#666]">
                This action is permanent and will remove the article and its review history.
              </p>
            </div>

            {/* Error Message Alert if API fails */}
            {deleteError && (
              <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-red-300 text-xs flex items-start gap-2 mb-4">
                <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <span className="flex-1 leading-relaxed">{deleteError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1f1f1f]">
              <button
                type="button"
                onClick={() => setDeleteModalBlog(null)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#1a1a1a] text-[#aaa] hover:text-white hover:bg-[#252525] border border-[#2a2a2a] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-md shadow-red-900/30 disabled:opacity-50"
              >
                {deletingId ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Delete Article</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
