import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  ExternalLink,
  Edit2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  FileText,
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const API = `${BASE_URL}/api/newsletters`;

export default function AdminNewsletters() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newsletters, setNewsletters] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [form, setForm] = useState({ title: "", link: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalNewsletter, setDeleteModalNewsletter] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const getToken = () => localStorage.getItem("accessToken");

  // Fetch newsletters
  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      setFetchError("");
      const res = await fetch(API);
      if (!res.ok) throw new Error("Failed to load newsletters");
      const data = await res.json();
      setNewsletters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching newsletters:", err);
      setFetchError(err.message || "Failed to load newsletters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletters();
  }, []);

  // Validate Google Drive URL
  const isValidGoogleDriveLink = (url) => {
    if (!url || typeof url !== "string") return false;
    const trimmedUrl = url.trim();
    return (
      trimmedUrl.includes("drive.google.com") ||
      trimmedUrl.includes("docs.google.com")
    );
  };

  const handleUpload = async () => {
    if (!form.title || !form.link) {
      setUploadError("Please fill in all fields");
      return;
    }

    if (!isValidGoogleDriveLink(form.link)) {
      setUploadError(
        "Invalid Google Drive link. Please use a drive.google.com or docs.google.com link"
      );
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const method = editingId ? "PATCH" : "POST";
      const endpoint = editingId ? `${API}/${editingId}` : API;

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          title: form.title,
          link: form.link,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save newsletter");
      }

      const data = await res.json();

      if (editingId) {
        setNewsletters((prev) =>
          prev.map((n) => (n._id === editingId ? data.newsletter : n))
        );
        setEditingId(null);
        setToastMessage("Newsletter updated successfully!");
      } else {
        setNewsletters((prev) => [data.newsletter, ...prev]);
        setToastMessage("Newsletter published successfully!");
      }

      setForm({ title: "", link: "" });
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      setTimeout(() => setToastMessage(""), 4000);
    } catch (err) {
      console.error("Error:", err);
      setUploadError(err.message || "Failed to save newsletter");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (newsletter) => {
    setEditingId(newsletter._id);
    setForm({ title: newsletter.title, link: newsletter.file_url });
    setUploadError("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ title: "", link: "" });
    setUploadError("");
  };

  const openDeleteModal = (newsletter) => {
    setDeleteError("");
    setDeleteModalNewsletter(newsletter);
  };

  const handleExecuteDelete = async () => {
    if (!deleteModalNewsletter) return;
    const id = deleteModalNewsletter._id;
    setDeletingId(id);
    setDeleteError("");

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete newsletter");
      }

      const deletedTitle = deleteModalNewsletter.title;
      setNewsletters((prev) => prev.filter((n) => n._id !== id));
      setDeleteModalNewsletter(null);
      setToastMessage(`"${deletedTitle}" deleted successfully`);
      setTimeout(() => setToastMessage(""), 4000);
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError(err.message || "Failed to delete newsletter");
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenLink = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 overflow-auto">
        <div
          className="p-8 min-h-screen max-md:pt-20"
          style={{ background: "#0d0d0d" }}
        >
          <div className="mb-8">
            <h1
              className="text-3xl font-bold text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Newsletter Management
            </h1>
            <p className="text-[#555] text-sm mt-1">
              Create and manage society newsletters with Google Drive links
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add/Edit Panel */}
            <div className="lg:col-span-1">
              <div
                className="rounded-xl border p-6 sticky top-6"
                style={{ background: "#111", borderColor: "#1f1f1f" }}
              >
                <h2
                  className="text-white font-semibold mb-5"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {editingId ? "Edit Newsletter" : "Add Newsletter"}
                </h2>

                <div className="mb-4">
                  <label className="text-[#666] text-xs mb-1.5 block font-medium">
                    Newsletter Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Monthly Digest - March 2026"
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none border transition-colors"
                    style={{
                      background: "#0d0d0d",
                      borderColor: form.title ? "#a855f7" : "#2a2a2a",
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label className="text-[#666] text-xs mb-1.5 block font-medium">
                    Google Drive Link *
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    value={form.link}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, link: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none border transition-colors"
                    style={{
                      background: "#0d0d0d",
                      borderColor: form.link ? "#a855f7" : "#2a2a2a",
                    }}
                  />
                  <p className="text-[#555] text-xs mt-2 leading-relaxed">
                    📌 Get shareable link from Google Drive: Right-click file →
                    Share → Copy link
                  </p>
                </div>

                {uploadError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                    ⚠ {uploadError}
                  </div>
                )}

                {uploadSuccess && (
                  <div className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
                    ✓ Newsletter saved successfully!
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleUpload}
                    disabled={uploading || !form.title || !form.link}
                    className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #a855f7, #6366f1)",
                      color: "white",
                    }}
                  >
                    {uploading ? "Saving..." : editingId ? "Update" : "Add"}
                  </button>
                  {editingId && (
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2.5 rounded-lg font-semibold text-sm border transition-all hover:bg-[#1f1f1f]"
                      style={{ borderColor: "#2a2a2a", color: "#666" }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Newsletter List */}
            <div
              className="lg:col-span-2 rounded-xl border p-6"
              style={{ background: "#111", borderColor: "#1f1f1f" }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="text-white font-semibold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Newsletters {loading ? "" : `(${newsletters.length})`}
                </h2>
                {loading && (
                  <span className="flex items-center gap-1.5 text-xs text-purple-400">
                    <Loader2 size={13} className="animate-spin" />
                    Loading newsletters...
                  </span>
                )}
              </div>

              {fetchError && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-red-300 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={15} className="text-red-400 shrink-0" />
                    <span>{fetchError}</span>
                  </div>
                  <button
                    onClick={fetchNewsletters}
                    className="px-2.5 py-1 rounded bg-red-800/40 hover:bg-red-800/60 text-white font-medium text-[11px] transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {loading ? (
                /* Skeleton Loaders */
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((sk) => (
                    <div
                      key={sk}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border border-[#1f1f1f] bg-[#141414] animate-pulse"
                    >
                      <div className="flex-1 min-w-0 mb-3 sm:mb-0 space-y-2">
                        <div className="w-3/5 h-4 bg-[#222] rounded" />
                        <div className="w-1/4 h-3 bg-[#181818] rounded" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#1a1a1a]" />
                        <div className="w-8 h-8 rounded-lg bg-[#1a1a1a]" />
                        <div className="w-8 h-8 rounded-lg bg-[#1a1a1a]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : newsletters.length === 0 ? (
                <div
                  className="p-12 text-center rounded-xl border border-[#1f1f1f]"
                  style={{ background: "#0d0d0d" }}
                >
                  <FileText size={32} className="mx-auto mb-3 text-[#444]" />
                  <p className="text-white text-sm font-medium mb-1">
                    No newsletters yet
                  </p>
                  <p className="text-[#555] text-xs">
                    Create and publish your first newsletter using the form on the left.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {newsletters.map((newsletter) => (
                    <div
                      key={newsletter._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl transition-all border"
                      style={{
                        borderColor: "#1f1f1f",
                        background:
                          editingId === newsletter._id
                            ? "#1a1a1a"
                            : "#131313",
                      }}
                    >
                      <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                        <p className="text-white font-medium truncate">
                          {newsletter.title}
                        </p>
                        <p className="text-[#555] text-xs mt-1">
                          {new Date(newsletter.created_at).toLocaleDateString()}{" "}
                          · {newsletter.downloads || 0} opens
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenLink(newsletter.file_url)}
                          className="p-2 rounded-lg hover:bg-blue-500/20 text-[#888] hover:text-blue-400 transition-colors"
                          title="Open in Google Drive"
                        >
                          <ExternalLink size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(newsletter)}
                          className="p-2 rounded-lg hover:bg-yellow-500/20 text-[#888] hover:text-yellow-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(newsletter)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-[#888] hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal UI Box */}
      {deleteModalNewsletter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !deletingId && setDeleteModalNewsletter(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 border border-[#262626] bg-[#111111] shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.85)" }}
          >
            {/* Close button */}
            <button
              onClick={() => !deletingId && setDeleteModalNewsletter(null)}
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
                  Delete Newsletter
                </h4>
                <p className="text-xs text-[#777] mt-0.5">
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Description & Preview */}
            <div className="rounded-xl p-3.5 bg-[#161616] border border-[#242424] mb-4">
              <p className="text-sm font-semibold text-white line-clamp-2 mb-1">
                {deleteModalNewsletter.title}
              </p>
              <p className="text-[11px] text-[#666]">
                Created on{" "}
                {new Date(
                  deleteModalNewsletter.created_at
                ).toLocaleDateString()}
              </p>
            </div>

            {/* Error message alert */}
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
                onClick={() => setDeleteModalNewsletter(null)}
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
                    <span>Delete Newsletter</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-950/90 border border-emerald-800/60 text-emerald-300 text-sm shadow-2xl animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage("")}
            className="text-emerald-400/60 hover:text-emerald-300 p-0.5 ml-2 rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
