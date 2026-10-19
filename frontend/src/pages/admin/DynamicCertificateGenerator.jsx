import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Download, FileSpreadsheet, Loader2, X } from "lucide-react";
import api from "../../services/api";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */
const MAX_CSV_BYTES = 5 * 1024 * 1024; // maximum, NOT minimum
const MAX_ROWS = 2000;
const PREVIEW_DEBOUNCE_MS = 400;
const SYSTEM_EMAIL_FIELD_ID = "email";
const SYSTEM_EMAIL_FIELD = {
  id: SYSTEM_EMAIL_FIELD_ID,
  label: "Email (required, not displayed)",
  system: true,
  hidden: true,
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const formatBytes = (bytes) =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const normalizeHeader = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_");
const normalizeName = (value) =>
  String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

/** RFC 4180 parser: quotes, "" escapes, CRLF, BOM, embedded commas/newlines. */
function parseCsv(text) {
  const src = text.replace(/^\uFEFF/, "");
  const table = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  const endRow = () => {
    row.push(cell);
    cell = "";
    if (row.some((c) => c.trim() !== "")) table.push(row);
    row = [];
  };

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; } else inQuotes = false;
      } else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      endRow();
    } else cell += ch;
  }
  endRow();

  if (!table.length) return { headers: [], rows: [] };

  const headers = table[0].map(normalizeHeader);
  const rows = table.slice(1).map((cells) =>
    Object.fromEntries(headers.map((header, index) => [header, (cells[index] ?? "").trim()]))
  );
  return { headers, rows };
}

const csvCell = (value) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
const toCsv = (headers, rows) =>
  [headers.map(csvCell).join(","), ...rows.map((r) => headers.map((h) => csvCell(r[h] ?? "")).join(","))].join("\r\n");

function autoMapFields(fields, headers) {
  const used = new Set();
  return Object.fromEntries(
    fields.map((field) => {
      const names = [normalizeName(field.id), normalizeName(field.label)].filter(Boolean);
      const exact = headers.find((h) => !used.has(h) && names.includes(normalizeName(h)));
      const match =
        exact ||
        headers.find(
          (h) =>
            !used.has(h) &&
            names.some((n) => n.length >= 3 && (normalizeName(h).includes(n) || n.includes(normalizeName(h))))
        );
      if (match) used.add(match);
      return [field.id, match || ""];
    })
  );
}

const normalizeTemplate = (template) => ({
  ...template,
  fields: [SYSTEM_EMAIL_FIELD, ...(template.fields || []).filter((field) => field.id !== SYSTEM_EMAIL_FIELD_ID)],
});

/** Works for JSON errors and for error bodies that arrive as a Blob (responseType: "blob"). */
async function readError(error, fallback) {
  if (error?.code === "ERR_CANCELED") return "";
  const status = error.response?.status;
  let data = error.response?.data;
  if (data instanceof Blob) {
    try { data = JSON.parse(await data.text()); } catch { data = null; }
  }
  if (data?.error || data?.message) return data.error || data.message;
  if (status === 413) return "The file is too large for the server";
  if (status === 429) return "Too many requests. Please wait a moment and try again";
  if (!error.response) return "Network error. Check your connection and try again";
  return fallback;
}

function filenameFromHeaders(headers, fallback) {
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(headers?.["content-disposition"] || "");
  return match ? decodeURIComponent(match[1]) : fallback;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function DynamicCertificateGenerator() {
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [templateId, setTemplateId] = useState("");
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [previewRow, setPreviewRow] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef(null);
  const generateAbortRef = useRef(null);
  const previewSeqRef = useRef(0);

  const template = useMemo(() => templates.find((t) => t._id === templateId) || null, [templates, templateId]);
  const fields = template?.fields || [];

  /* ---- load templates -------------------------------------------- */
  useEffect(() => {
    const controller = new AbortController();
    api
      .get("/certificate-templates?activeOnly=true", { signal: controller.signal })
      .then((res) => setTemplates((res.data.templates || []).map(normalizeTemplate)))
      .catch((err) => {
        if (err?.code !== "ERR_CANCELED") setError("Could not load certificate templates");
      })
      .finally(() => setLoadingTemplates(false));
    return () => controller.abort();
  }, []);

  /* ---- cleanup ----------------------------------------------------- */
  useEffect(() => () => generateAbortRef.current?.abort(), []);
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  /* ---- derived ------------------------------------------------------ */
  const unmapped = useMemo(() => fields.filter((f) => !mapping[f.id]), [fields, mapping]);
  const rowsWithEmptyCells = useMemo(() => {
    const cols = fields.map((f) => mapping[f.id]).filter(Boolean);
    return rows.filter((r) => cols.some((c) => !r[c])).length;
  }, [rows, fields, mapping]);
  const canGenerate = !!file && rows.length > 0 && unmapped.length === 0 && !generating;

  /* ---- actions ------------------------------------------------------ */
  const resetCsv = () => {
    setFile(null);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setPreviewRow(0);
    setPreviewUrl("");
    setPreviewError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectTemplate = (id) => {
    generateAbortRef.current?.abort();
    setTemplateId(id);
    setError("");
    resetCsv();
  };

  const processFile = async (selected) => {
    if (!selected || !template) return;
    setError("");

    if (!/\.csv$/i.test(selected.name)) return setError("Please select a .csv file");
    if (selected.size === 0) return setError("This file is empty");
    if (selected.size > MAX_CSV_BYTES) {
      return setError(`File is ${formatBytes(selected.size)}. Maximum allowed size is ${formatBytes(MAX_CSV_BYTES)}`);
    }

    try {
      const parsed = parseCsv(await selected.text());
      if (!parsed.headers.length || !parsed.rows.length) {
        return setError("CSV must contain a header row and at least one data row");
      }
      if (parsed.headers[0] !== SYSTEM_EMAIL_FIELD_ID) {
        return setError("The first CSV column must be email");
      }
      if (parsed.rows.length > MAX_ROWS) {
        return setError(`Too many rows (${parsed.rows.length}). Maximum is ${MAX_ROWS} per file`);
      }
      setFile(selected);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setMapping(autoMapFields(template.fields || [], parsed.headers));
      setPreviewRow(0);
    } catch (err) {
      setError("Could not read this file: " + err.message);
    }
  };

  /* ---- auto preview (debounced, stale responses ignored) ------------ */
  useEffect(() => {
    if (!template || !rows.length || unmapped.length > 0) {
      setPreviewUrl("");
      setPreviewError("");
      return;
    }
    const seq = ++previewSeqRef.current;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setPreviewing(true);
      setPreviewError("");
      try {
        const data = Object.fromEntries(fields.map((f) => [f.id, rows[previewRow]?.[mapping[f.id]] ?? ""]));
        const res = await api.post(
          "/dynamic-certificates/preview",
          { templateId, data },
          { responseType: "blob", signal: controller.signal }
        );
        if (seq === previewSeqRef.current) setPreviewUrl(URL.createObjectURL(res.data));
      } catch (err) {
        const message = await readError(err, "Could not render preview");
        if (message && seq === previewSeqRef.current) setPreviewError(message);
      } finally {
        if (seq === previewSeqRef.current) setPreviewing(false);
      }
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [template, templateId, fields, rows, mapping, previewRow, unmapped.length]);

  /* ---- generate ZIP -------------------------------------------------- */
  const generate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    setError("");
    const controller = new AbortController();
    generateAbortRef.current = controller;

    try {
      // Upload exactly what was mapped: normalized headers, blank rows removed.
      const cleanFile = new File([toCsv(headers, rows)], file.name.replace(/\.csv$/i, "") + "-clean.csv", {
        type: "text/csv",
      });
      const form = new FormData();
      form.append("templateId", templateId);
      form.append("mapping", JSON.stringify(mapping));
      form.append("file", cleanFile);

      // No manual Content-Type: the browser must set the multipart boundary.
      const res = await api.post("/dynamic-certificates/generate", form, {
        headers: { "Content-Type": undefined },
        responseType: "blob",
        signal: controller.signal,
        timeout: 0,
      });

      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filenameFromHeaders(res.headers, "certificates.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      const message = await readError(err, "Could not generate certificates");
      if (message) setError(message);
    } finally {
      setGenerating(false);
      generateAbortRef.current = null;
    }
  };

  const previewRowLabel = (row, index) => {
    const first = row?.[mapping[fields[0]?.id]];
    return `Row ${index + 1}${first ? ` — ${first.slice(0, 40)}` : ""}`;
  };

  /* ---- render --------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-[#0d0d0d] p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold">Certificate Generator</h1>
        <p className="mb-8 mt-1 text-[#777]">Select a template, map your CSV columns, and generate certificates.</p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          {/* LEFT: controls */}
          <section className="space-y-5 rounded-xl border border-[#252525] bg-[#111] p-5">
            <label className="block">
              <span className="text-sm text-[#aaa]">Certificate template</span>
              <select
                value={templateId}
                onChange={(e) => selectTemplate(e.target.value)}
                disabled={loadingTemplates || generating}
                className="mt-2 w-full rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-3"
              >
                <option value="">{loadingTemplates ? "Loading templates..." : "Select a template"}</option>
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </label>

            {template && (
              <>
                <label
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files?.[0]); }}
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                    dragging ? "border-[#fbbf24] bg-[#fbbf2410]" : "border-[#2a2a2a] hover:border-[#fbbf2480]"
                  }`}
                >
                  <FileSpreadsheet size={26} className="text-[#fbbf24]" />
                  {file ? (
                    <p className="text-sm">
                      {file.name} <span className="text-[#777]">· {rows.length} rows · {headers.length} columns</span>
                    </p>
                  ) : (
                    <p className="text-sm text-[#999]">
                      Drop a CSV here or click to browse
                      <span className="block text-xs text-[#666]">
                        Max {formatBytes(MAX_CSV_BYTES)} · {MAX_ROWS} rows
                      </span>
                    </p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => processFile(e.target.files?.[0])}
                  />
                </label>

                {file && (
                  <button onClick={resetCsv} disabled={generating} className="flex items-center gap-1 text-xs text-[#999] hover:text-white">
                    <X size={13} /> Remove file
                  </button>
                )}

                {rows.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="font-semibold">Map CSV columns</h2>
                    {fields.map((field) => (
                      <label key={field.id} className="block">
                        <span className="text-sm">
                          {field.label || field.id} <small className="text-[#777]">({field.id})</small>
                        </span>
                        <select
                          value={mapping[field.id] || ""}
                          onChange={(e) => setMapping((cur) => ({ ...cur, [field.id]: e.target.value }))}
                          className={`mt-1 w-full rounded-lg border bg-[#0d0d0d] p-2 ${
                            mapping[field.id] ? "border-[#2a2a2a]" : "border-red-500/50"
                          }`}
                        >
                          <option value="">Select CSV column</option>
                          {headers.map((h) => (
                            <option key={h} value={h}>
                              {h}
                              {rows[0]?.[h] ? ` — e.g. ${rows[0][h].slice(0, 24)}` : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}

                    {unmapped.length > 0 && (
                      <p className="text-xs text-red-400">
                        Map every field to continue. Missing: {unmapped.map((f) => f.label || f.id).join(", ")}
                      </p>
                    )}
                    {unmapped.length === 0 && rowsWithEmptyCells > 0 && (
                      <p className="flex items-start gap-1 text-xs text-[#fbbf24]">
                        <AlertCircle size={13} className="mt-0.5 shrink-0" />
                        {rowsWithEmptyCells} row{rowsWithEmptyCells === 1 ? " has" : "s have"} an empty value in a mapped
                        column. Those certificates will have blank text.
                      </p>
                    )}

                    <button
                      onClick={generate}
                      disabled={!canGenerate}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#f59e0b] px-4 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {generating ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}
                      {generating ? `Generating ${rows.length} certificates...` : `Generate ZIP (${rows.length})`}
                    </button>
                    {generating && (
                      <button onClick={() => generateAbortRef.current?.abort()} className="text-xs text-[#999] hover:text-white">
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {error && (
              <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </p>
            )}
          </section>

          {/* RIGHT: sticky preview */}
          <section className="self-start rounded-xl border border-[#252525] bg-[#111] p-5 lg:sticky lg:top-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-semibold">Preview</h2>
              {rows.length > 1 && unmapped.length === 0 && (
                <select
                  value={previewRow}
                  onChange={(e) => setPreviewRow(Number(e.target.value))}
                  aria-label="Row to preview"
                  className="max-w-[60%] truncate rounded-md border border-[#2a2a2a] bg-[#0d0d0d] p-2 text-sm"
                >
                  {rows.slice(0, 200).map((row, i) => (
                    <option key={i} value={i}>{previewRowLabel(row, i)}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#0d0d0d]">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Certificate preview"
                  className={`h-full w-full object-contain transition-opacity ${previewing ? "opacity-40" : "opacity-100"}`}
                />
              )}
              {previewing && <Loader2 size={28} className="absolute animate-spin text-[#fbbf24]" />}
              {!previewUrl && !previewing && (
                <p className="px-6 text-center text-sm text-[#666]">
                  {previewError || (rows.length ? "Map all columns to see a live preview" : "Select a template and upload a CSV to see a preview")}
                </p>
              )}
            </div>
            {previewError && previewUrl && <p className="mt-2 text-xs text-red-400">{previewError}</p>}
            <p className="mt-2 text-xs text-[#666]">
              The preview is rendered by the same server code as the final certificates.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}