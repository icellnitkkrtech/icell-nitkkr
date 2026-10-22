import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Award,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import AdminSidebar from "../../components/admin/AdminSidebar";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */
const PAGE_SIZE = 20;
const ALLOWED_ROLES = ["admin", "post_holder"];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const errorMessage = (err, fallback) => err?.response?.data?.error || err?.response?.data?.message || fallback;

/* ------------------------------------------------------------------ */
/* Modals & Toasts                                                     */
/* ------------------------------------------------------------------ */
function Modal({ title, onClose, children, widthClass = "max-w-md" }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[90vh] w-full ${widthClass} overflow-y-auto rounded-xl border border-[#1f1f1f] bg-[#111111] p-6`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 hover:bg-[#1f1f1f]">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  const ok = toast.type === "success";
  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-[60] flex max-w-sm items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-xl"
      style={{
        background: ok ? "#0f2a1f" : "#2a1212",
        borderColor: ok ? "#10b98150" : "#ef444450",
        color: ok ? "#6ee7b7" : "#fca5a5",
      }}
    >
      {ok ? <CheckCircle size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
      <span>{toast.message}</span>
      <button onClick={onClose} aria-label="Dismiss" className="ml-2 opacity-70 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page Component                                                      */
/* ------------------------------------------------------------------ */
export default function AdminCertificates() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isAllowed = !!user && ALLOWED_ROLES.includes(user.role);

  const [certificates, setCertificates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const [selectedTemplate, setSelectedTemplate] = useState("all");
  const [page, setPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null);

  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  const notify = useCallback((type, message) => setToast({ type, message }), []);
  const closeToast = useCallback(() => setToast(null), []);
  const closeConfirm = useCallback(() => setConfirmState(null), []);

  /* ---- auth guard ------------------------------------------------- */
  useEffect(() => {
    if (!authLoading && !isAllowed) navigate("/", { replace: true });
  }, [authLoading, isAllowed, navigate]);

  /* ---- fetch certificates & templates ----------------------------- */
  const loadCertificates = useCallback(async (signal) => {
    try {
      const { data } = await api.get("/certificate/admin/all", { signal });
      setCertificates(data?.certificates ?? []);
      setLoadError("");
    } catch (err) {
      if (err?.code === "ERR_CANCELED") return;
      setLoadError(errorMessage(err, "Could not load certificates"));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !isAllowed) return;
    const controller = new AbortController();
    loadCertificates(controller.signal);

    // Load templates for filter dropdown
    api
      .get("/certificate-templates", { signal: controller.signal })
      .then((res) => setTemplates(res.data?.templates || []))
      .catch((err) => {
        if (err?.code !== "ERR_CANCELED") console.error("Could not load templates:", err);
      });

    return () => controller.abort();
  }, [authLoading, isAllowed, loadCertificates]);

  /* ---- download single certificate -------------------------------- */
  const handleDownload = async (cert) => {
    try {
      setDownloadingId(cert._id);
      const res = await api.get(`/certificate/download/${cert._id}`, { responseType: "blob" });
      const safeTitle = (cert.title || "certificate").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${safeTitle}-${cert._id}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      notify("success", "Certificate downloaded successfully");
    } catch (err) {
      notify("error", errorMessage(err, "Failed to download certificate"));
    } finally {
      setDownloadingId(null);
    }
  };

  /* ---- delete ------------------------------------------------------ */
  const requestDelete = (cert) =>
    setConfirmState({
      title: "Delete certificate",
      message: `Delete certificate "${cert.title || "Certificate"}" for ${cert.user_name || cert.recipient_email || "this recipient"}? This cannot be undone.`,
      confirmLabel: "Delete",
      onConfirm: async () => {
        try {
          await api.delete(`/certificate/admin/${cert._id}`);
          setCertificates((cur) => cur.filter((c) => c._id !== cert._id));
          notify("success", "Certificate deleted");
        } catch (err) {
          notify("error", errorMessage(err, "Failed to delete certificate"));
        } finally {
          setConfirmState(null);
        }
      },
    });

  /* ---- derived data ------------------------------------------------- */
  const filteredCertificates = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return certificates.filter((cert) => {
      if (selectedTemplate !== "all" && cert.template_id !== selectedTemplate) return false;
      if (!q) return true;
      return [
        cert.title,
        cert.user_name,
        cert.recipient_email,
        cert.user_email,
      ].some((v) => v?.toLowerCase().includes(q));
    });
  }, [certificates, deferredSearch, selectedTemplate]);

  const totalPages = Math.max(1, Math.ceil(filteredCertificates.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredCertificates.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (authLoading || !isAllowed) return null;

  /* ---- render --------------------------------------------------------- */
  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-md:pt-20">
          <div className="mb-8">
            <h1 className="mb-1 text-3xl font-bold">Certificates</h1>
            <p className="text-[#777]">Manage, search, and issue template certificates to students</p>
          </div>

          {/* Stats Card */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:max-w-xl">
            <StatCard label="Total Certificates" value={certificates.length} border="#1f1f1f" bg="#111111" />
            <StatCard
              label="Active Templates"
              value={templates.filter((t) => t.active !== false).length}
              color="#fbbf24"
              border="#fbbf2430"
              bg="#fbbf2408"
            />
          </div>

          {/* Actions */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate("/admin/certificates/generate")}
              className="flex items-center gap-2 rounded-lg bg-[#f59e0b] px-6 py-3 font-semibold text-black transition-colors hover:bg-[#fbbf24]"
            >
              <Award size={18} /> Generate from template
            </button>
          </div>

          {/* Search & Template Filter */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-3 text-[#555]" />
              <input
                type="search"
                aria-label="Search certificates"
                placeholder="Search by title, recipient name, or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-[#1f1f1f] bg-[#111111] py-2.5 pl-10 pr-4 text-white placeholder-[#555] focus:border-[#fbbf24] focus:outline-none"
              />
            </div>
            <select
              aria-label="Filter by template"
              value={selectedTemplate}
              onChange={(e) => {
                setSelectedTemplate(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[#1f1f1f] bg-[#111111] px-4 py-2.5 text-white focus:border-[#fbbf24] focus:outline-none"
            >
              <option value="all">All Templates</option>
              {templates.map((tpl) => (
                <option key={tpl._id} value={tpl._id}>
                  {tpl.name}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <p className="py-12 text-center text-[#777]">Loading certificates...</p>
          ) : loadError ? (
            <div className="rounded-xl border border-[#ef444430] bg-[#ef444410] p-8 text-center">
              <p className="mb-3 text-[#fca5a5]">{loadError}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  loadCertificates();
                }}
                className="rounded-lg border border-[#ef444450] px-4 py-2 text-sm text-[#fca5a5] hover:bg-[#ef444415]"
              >
                Retry
              </button>
            </div>
          ) : filteredCertificates.length ? (
            <>
              <div className="overflow-hidden rounded-xl border border-[#1f1f1f]">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1f1f1f] bg-[#111111]">
                        {["Title", "Recipient", "Email", "Date"].map((h) => (
                          <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase text-[#777]">
                            {h}
                          </th>
                        ))}
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-[#777]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((cert) => (
                        <tr key={cert._id} className="border-t border-[#1f1f1f] transition-colors hover:bg-[#111111]">
                          <td className="px-6 py-4 font-semibold text-white">
                            {cert.title || "Certificate"}
                          </td>
                          <td className="px-6 py-4 font-medium text-[#ccc]">
                            {cert.user_name || "—"}
                          </td>
                          <td className="px-6 py-4 text-[#999]">
                            {cert.recipient_email || cert.user_email || "N/A"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-[#999]">
                            {formatDate(cert.issued_date)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleDownload(cert)}
                                disabled={downloadingId === cert._id}
                                title="Download certificate PNG"
                                aria-label={`Download certificate for ${cert.user_name || cert.recipient_email}`}
                                className="rounded-lg p-2 text-[#fbbf24] transition-colors hover:bg-[#fbbf2415] disabled:opacity-40"
                              >
                                <Download size={16} />
                              </button>
                              <button
                                onClick={() => requestDelete(cert)}
                                aria-label={`Delete certificate for ${cert.user_name || cert.recipient_email}`}
                                className="rounded-lg p-2 text-[#ef4444] transition-colors hover:bg-[#ef444415]"
                                title="Delete certificate"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between text-sm text-[#777]">
                <span>
                  Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredCertificates.length)} of{" "}
                  {filteredCertificates.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(safePage - 1)}
                    disabled={safePage <= 1}
                    aria-label="Previous page"
                    className="rounded-lg border border-[#1f1f1f] p-2 hover:bg-[#111] disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span>
                    {safePage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(safePage + 1)}
                    disabled={safePage >= totalPages}
                    aria-label="Next page"
                    className="rounded-lg border border-[#1f1f1f] p-2 hover:bg-[#111] disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-[#1f1f1f] p-12 text-center">
              <Award size={40} className="mx-auto mb-4 text-[#555]" />
              <p className="text-[#777]">No certificates found</p>
              <p className="mt-1 text-sm text-[#555]">
                {selectedTemplate !== "all"
                  ? "No certificates found for this template filter"
                  : "Generate certificates using custom designs from templates"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmState && (
        <Modal title={confirmState.title} onClose={closeConfirm}>
          <p className="mb-6 text-sm text-[#999]">{confirmState.message}</p>
          <div className="flex gap-3">
            <button onClick={closeConfirm} className="flex-1 rounded-lg border border-[#1f1f1f] px-4 py-2 hover:bg-[#1a1a1a]">
              Cancel
            </button>
            <button
              onClick={confirmState.onConfirm}
              className="flex-1 rounded-lg bg-[#ef4444] px-4 py-2 font-semibold text-white hover:bg-[#dc2626]"
            >
              {confirmState.confirmLabel || "Confirm"}
            </button>
          </div>
        </Modal>
      )}

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

function StatCard({ label, value, color = "#ffffff", border, bg }) {
  return (
    <div className="rounded-xl border p-6" style={{ borderColor: border, background: bg }}>
      <p className="mb-2 text-sm text-[#999]">{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}