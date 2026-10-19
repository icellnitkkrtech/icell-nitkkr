import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Award,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import AdminSidebar from "../../components/admin/AdminSidebar";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */
const MAX_CSV_BYTES = 5 * 1024 * 1024; // maximum, NOT minimum
const MAX_CSV_ROWS = 2000;
const PAGE_SIZE = 20;
const REQUIRED_HEADERS = ["email", "name", "achievement"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PENDING_BATCH_KEY = "certificates:pendingBatch";
const ALLOWED_ROLES = ["admin", "post_holder"];

const TYPE_META = {
  member: { label: "Member", color: "#fbbf24", bg: "#fbbf2415", icon: "🎖️" },
  post_holder: { label: "Post Holder", color: "#e94560", bg: "#e9456015", icon: "👑" },
  event: { label: "Achievement", color: "#06b6d4", bg: "#06b6d415", icon: "⭐" },
};
const UNKNOWN_TYPE = { label: "Unknown", color: "#666666", bg: "#66666610", icon: "📜" };

/* ------------------------------------------------------------------ */
/* CSV helpers (RFC 4180: quotes, CRLF, BOM, embedded commas/newlines) */
/* ------------------------------------------------------------------ */
function parseCsv(text) {
  const src = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  let line = 1;
  let rowStartLine = 1;

  const pushRow = () => {
    row.push(cell);
    cell = "";
    if (row.some((c) => c.trim() !== "")) rows.push({ cells: row, line: rowStartLine });
    row = [];
  };

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else {
        if (ch === "\n") line++;
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      pushRow();
      line++;
      rowStartLine = line;
    } else {
      cell += ch;
    }
  }
  pushRow();
  return rows;
}

function analyseCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return { records: [], issues: [], fatal: "CSV must contain a header row and at least one data row" };
  }

  const headers = rows[0].cells.map((h) => h.trim().toLowerCase());
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length) {
    return {
      records: [],
      issues: [],
      fatal: `Missing required columns: ${missing.join(", ")}. Required: ${REQUIRED_HEADERS.join(", ")}`,
    };
  }
  if (rows.length - 1 > MAX_CSV_ROWS) {
    return { records: [], issues: [], fatal: `Too many rows (${rows.length - 1}). Maximum is ${MAX_CSV_ROWS} per upload` };
  }

  const idx = Object.fromEntries(REQUIRED_HEADERS.map((h) => [h, headers.indexOf(h)]));
  const records = [];
  const issues = [];
  const seen = new Set();

  for (const { cells, line } of rows.slice(1)) {
    const email = (cells[idx.email] || "").trim();
    const name = (cells[idx.name] || "").trim();
    const achievement = (cells[idx.achievement] || "").trim();

    if (!email || !name || !achievement) {
      issues.push(`Line ${line}: email, name and achievement are all required`);
      continue;
    }
    if (!EMAIL_RE.test(email)) {
      issues.push(`Line ${line}: "${email}" is not a valid email`);
      continue;
    }
    const key = `${email}|${name}|${achievement}`.toLowerCase();
    if (seen.has(key)) {
      issues.push(`Line ${line}: duplicate of an earlier row (skipped)`);
      continue;
    }
    seen.add(key);
    records.push({ email, name, achievement });
  }

  return { records, issues, fatal: records.length ? "" : "No valid rows found in this file" };
}

const csvCell = (value) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
const toCsv = (records) =>
  [REQUIRED_HEADERS.join(","), ...records.map((r) => REQUIRED_HEADERS.map((h) => csvCell(r[h])).join(","))].join("\r\n");

const formatBytes = (bytes) =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const readPendingBatch = () => {
  try {
    return JSON.parse(localStorage.getItem(PENDING_BATCH_KEY)) || null;
  } catch {
    return null;
  }
};

const errorMessage = (err, fallback) => err?.response?.data?.error || err?.response?.data?.message || fallback;

/* ------------------------------------------------------------------ */
/* Small UI pieces                                                     */
/* ------------------------------------------------------------------ */
function Modal({ title, onClose, children, widthClass = "max-w-2xl" }) {
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
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function AdminCertificates() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isAllowed = !!user && ALLOWED_ROLES.includes(user.role);

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState(null); // { title, message, confirmLabel, onConfirm }

  // CSV upload
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvRecords, setCsvRecords] = useState([]);
  const [csvIssues, setCsvIssues] = useState([]);
  const [csvFatal, setCsvFatal] = useState("");
  const [csvUploading, setCsvUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Pending batch (survives refresh)
  const [pendingBatch, setPendingBatch] = useState(readPendingBatch);
  const [confirmingBatch, setConfirmingBatch] = useState(false);

  const notify = useCallback((type, message) => setToast({ type, message }), []);
  const closeToast = useCallback(() => setToast(null), []);
  const closeConfirm = useCallback(() => setConfirmState(null), []);
  const fileInputRef = useRef(null);

  /* ---- auth guard ------------------------------------------------- */
  useEffect(() => {
    if (!authLoading && !isAllowed) navigate("/", { replace: true });
  }, [authLoading, isAllowed, navigate]);

  /* ---- data ------------------------------------------------------- */
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
    return () => controller.abort();
  }, [authLoading, isAllowed, loadCertificates]);

  const persistBatch = (batch) => {
    setPendingBatch(batch);
    try {
      if (batch) localStorage.setItem(PENDING_BATCH_KEY, JSON.stringify(batch));
      else localStorage.removeItem(PENDING_BATCH_KEY);
    } catch {
      /* storage unavailable: state still works for this session */
    }
  };

  /* ---- CSV handling ------------------------------------------------ */
  const resetCsv = () => {
    setCsvFile(null);
    setCsvRecords([]);
    setCsvIssues([]);
    setCsvFatal("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closeCsvModal = useCallback(() => {
    if (csvUploading) return;
    setShowCSVModal(false);
    resetCsv();
  }, [csvUploading]);

  const processFile = async (file) => {
    resetCsv();
    if (!file) return;

    if (!/\.csv$/i.test(file.name)) {
      setCsvFatal("Please select a .csv file");
      return;
    }
    if (file.size === 0) {
      setCsvFatal("This file is empty");
      return;
    }
    if (file.size > MAX_CSV_BYTES) {
      setCsvFatal(`File is ${formatBytes(file.size)}. Maximum allowed size is ${formatBytes(MAX_CSV_BYTES)}`);
      return;
    }

    setCsvFile(file);
    try {
      const { records, issues, fatal } = analyseCsv(await file.text());
      setCsvRecords(records);
      setCsvIssues(issues);
      setCsvFatal(fatal);
    } catch (err) {
      setCsvFatal("Could not read this file: " + err.message);
    }
  };

  const handleCSVUpload = async () => {
    if (csvUploading || !csvRecords.length) return;
    setCsvUploading(true);
    try {
      // Upload a cleaned CSV so the server receives exactly what was previewed.
      const cleanName = (csvFile?.name || "certificates.csv").replace(/\.csv$/i, "") + "-clean.csv";
      const cleanFile = new File([toCsv(csvRecords)], cleanName, { type: "text/csv" });
      const formData = new FormData();
      formData.append("file", cleanFile);

      const { data } = await api.post("/certificate/admin/upload-csv", formData);
      persistBatch({
        batchId: data.batch_id,
        certificateIds: data.certificate_ids || [],
        count: data.count ?? csvRecords.length,
      });
      notify("success", `Uploaded ${data.count ?? csvRecords.length} certificates. Confirm the batch to issue them.`);
      setShowCSVModal(false);
      resetCsv();
    } catch (err) {
      notify("error", errorMessage(err, "Failed to upload CSV"));
    } finally {
      setCsvUploading(false);
    }
  };

  const handleConfirmBatch = async () => {
    if (!pendingBatch?.batchId || confirmingBatch) return;
    setConfirmingBatch(true);
    try {
      await api.post("/certificate/admin/issue-batch", {
        batchId: pendingBatch.batchId,
        certificateIds: pendingBatch.certificateIds,
      });
      persistBatch(null);
      notify("success", "Batch confirmed and certificates issued");
      await loadCertificates();
    } catch (err) {
      notify("error", errorMessage(err, "Failed to confirm batch"));
    } finally {
      setConfirmingBatch(false);
    }
  };

  const downloadSampleCsv = () => {
    const sample = toCsv([
      { email: "student@example.com", name: "Student Name", achievement: "First place, Hackathon 2026" },
    ]);
    const url = URL.createObjectURL(new Blob([sample], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "certificates-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---- delete ------------------------------------------------------ */
  const requestDelete = (cert) =>
    setConfirmState({
      title: "Delete certificate",
      message: `Delete the certificate for ${cert.user_name || cert.user_email || "this recipient"}? This cannot be undone.`,
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
  const counts = useMemo(() => {
    const c = { member: 0, post_holder: 0, event: 0 };
    for (const cert of certificates) if (cert.certificate_type in c) c[cert.certificate_type]++;
    return c;
  }, [certificates]);

  const filteredCertificates = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return certificates.filter((cert) => {
      if (selectedFilter !== "all" && cert.certificate_type !== selectedFilter) return false;
      if (!q) return true;
      return [cert.user_name, cert.user_email, cert.metadata?.achievement, cert.metadata?.post_position].some((v) =>
        v?.toLowerCase().includes(q)
      );
    });
  }, [certificates, deferredSearch, selectedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCertificates.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredCertificates.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (authLoading || !isAllowed) return null;

  const canUpload = !csvUploading && csvRecords.length > 0 && !csvFatal;

  /* ---- render --------------------------------------------------------- */
  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-md:pt-20">
          <div className="mb-8">
            <h1 className="mb-1 text-3xl font-bold">Certificates</h1>
            <p className="text-[#777]">Manage and issue certificates to students</p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard label="Total Certificates" value={certificates.length} border="#1f1f1f" bg="#111111" />
            <StatCard label="Member Certificates" value={counts.member} color="#fbbf24" border="#fbbf2430" bg="#fbbf2408" />
            <StatCard label="Post Holder" value={counts.post_holder} color="#e94560" border="#e9456030" bg="#e9456008" />
            <StatCard label="Achievements" value={counts.event} color="#06b6d4" border="#06b6d430" bg="#06b6d408" />
          </div>

          {/* Pending batch banner */}
          {pendingBatch && (
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#10b98140] bg-[#10b98110] p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-[#34d399]">
                  {pendingBatch.count} uploaded certificate{pendingBatch.count === 1 ? "" : "s"} waiting to be issued
                </p>
                <p className="text-xs text-[#6b8f80]">They are not visible to recipients until you confirm this batch.</p>
              </div>
              <button
                onClick={handleConfirmBatch}
                disabled={confirmingBatch}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#10b981] px-5 py-2.5 font-semibold text-black disabled:opacity-50"
              >
                <CheckCircle size={18} />
                {confirmingBatch ? "Confirming..." : "Confirm & issue batch"}
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="mb-6 flex flex-col gap-3 md:flex-row">
            <button
              onClick={() => navigate("/admin/certificates/generate")}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#f59e0b30] px-6 py-3 font-medium text-[#fbbf24] transition-colors hover:bg-[#f59e0b40] md:flex-1"
            >
              <Award size={18} /> Generate from template
            </button>
            <button
              onClick={() => setShowCSVModal(true)}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#0ea5e930] px-6 py-3 font-medium text-[#0ea5e9] transition-colors hover:bg-[#0ea5e940] md:flex-1"
            >
              <Upload size={18} /> Upload CSV
            </button>
          </div>

          {/* Search & filter */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-3 text-[#555]" />
              <input
                type="search"
                aria-label="Search certificates"
                placeholder="Search by email, name, or achievement..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-[#1f1f1f] bg-[#111111] py-2.5 pl-10 pr-4 text-white placeholder-[#555] focus:border-[#0ea5e9] focus:outline-none"
              />
            </div>
            <select
              aria-label="Filter by type"
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[#1f1f1f] bg-[#111111] px-4 py-2.5 text-white focus:border-[#0ea5e9] focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="member">Member</option>
              <option value="post_holder">Post Holder</option>
              <option value="event">Event Achievement</option>
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
                        {["Type", "Recipient", "Email", "Details", "Date"].map((h) => (
                          <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase text-[#777]">
                            {h}
                          </th>
                        ))}
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-[#777]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map((cert) => {
                        const meta = TYPE_META[cert.certificate_type] || UNKNOWN_TYPE;
                        const details =
                          cert.certificate_type === "event"
                            ? cert.metadata?.achievement
                            : cert.certificate_type === "post_holder"
                            ? cert.metadata?.post_position
                            : "Member";
                        return (
                          <tr key={cert._id} className="border-t border-[#1f1f1f] transition-colors hover:bg-[#111111]">
                            <td className="px-6 py-4">
                              <span
                                className="flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                                style={{ background: meta.bg, color: meta.color }}
                              >
                                <span aria-hidden>{meta.icon}</span>
                                {meta.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium">{cert.user_name || "(Deleted User)"}</td>
                            <td className="px-6 py-4 text-[#999]">{cert.user_email || "N/A"}</td>
                            <td className="px-6 py-4 text-[#999]">{details || "—"}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-[#999]">{formatDate(cert.issued_date)}</td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end">
                                <button
                                  onClick={() => requestDelete(cert)}
                                  aria-label={`Delete certificate for ${cert.user_name || cert.user_email}`}
                                  className="rounded-lg p-2 transition-colors hover:bg-[#1f1f1f]"
                                >
                                  <Trash2 size={16} className="text-[#ef4444]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

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
              <p className="mt-1 text-sm text-[#555]">Upload a CSV file to issue certificates in bulk</p>
            </div>
          )}
        </div>
      </div>

      {/* CSV modal */}
      {showCSVModal && (
        <Modal title="Upload Certificates CSV" onClose={closeCsvModal}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[#777]">
            <p>
              Required columns: <code className="text-[#aaa]">email</code>, <code className="text-[#aaa]">name</code>,{" "}
              <code className="text-[#aaa]">achievement</code>. Max {formatBytes(MAX_CSV_BYTES)} / {MAX_CSV_ROWS} rows.
            </p>
            <button onClick={downloadSampleCsv} className="flex items-center gap-1 text-[#0ea5e9] hover:underline">
              <Download size={14} /> Sample CSV
            </button>
          </div>

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              processFile(e.dataTransfer.files?.[0]);
            }}
            className={`mb-4 flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              dragging ? "border-[#0ea5e9] bg-[#0ea5e910]" : "border-[#2a2a2a] hover:border-[#0ea5e980]"
            }`}
          >
            <FileText size={28} className="text-[#0ea5e9]" />
            {csvFile ? (
              <p className="text-sm">
                {csvFile.name} <span className="text-[#777]">({formatBytes(csvFile.size)})</span>
              </p>
            ) : (
              <p className="text-sm text-[#999]">Drop a CSV here or click to browse</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => processFile(e.target.files?.[0])}
            />
          </label>

          {csvFatal && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#ef444430] bg-[#ef444415] p-3 text-sm text-[#fca5a5]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {csvFatal}
            </div>
          )}

          {csvIssues.length > 0 && !csvFatal && (
            <div className="mb-4 rounded-lg border border-[#f59e0b30] bg-[#f59e0b10] p-3">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-[#fbbf24]">
                <AlertCircle size={16} />
                {csvIssues.length} row{csvIssues.length === 1 ? "" : "s"} will be skipped
              </p>
              <ul className="max-h-28 space-y-1 overflow-y-auto text-xs text-[#d4a84b]">
                {csvIssues.slice(0, 50).map((issue, i) => (
                  <li key={i}>• {issue}</li>
                ))}
                {csvIssues.length > 50 && <li>…and {csvIssues.length - 50} more</li>}
              </ul>
            </div>
          )}

          {csvRecords.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium">Preview ({csvRecords.length} valid records)</p>
              <div className="overflow-x-auto rounded-lg border border-[#1f1f1f] bg-[#0d0d0d]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1f1f1f] text-left text-[#777]">
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Achievement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvRecords.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b border-[#1f1f1f] text-[#999]">
                        <td className="px-4 py-2">{row.email}</td>
                        <td className="px-4 py-2">{row.name}</td>
                        <td className="px-4 py-2">{row.achievement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvRecords.length > 5 && (
                  <p className="px-4 py-2 text-xs text-[#777]">…and {csvRecords.length - 5} more</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={closeCsvModal}
              disabled={csvUploading}
              className="flex-1 rounded-lg border border-[#1f1f1f] px-4 py-2 transition-colors hover:bg-[#1a1a1a] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCSVUpload}
              disabled={!canUpload}
              className="flex-1 rounded-lg bg-[#0ea5e930] px-4 py-2 font-medium text-[#0ea5e9] transition-colors hover:bg-[#0ea5e940] disabled:cursor-not-allowed disabled:bg-[#2a2a2a] disabled:text-[#777]"
            >
              {csvUploading ? "Uploading..." : `Upload ${csvRecords.length || ""} certificates`.trim()}
            </button>
          </div>
        </Modal>
      )}

      {/* Confirm dialog */}
      {confirmState && (
        <Modal title={confirmState.title} onClose={closeConfirm} widthClass="max-w-md">
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