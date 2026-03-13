import { useState, useRef } from "react";

const initialNewsletters = [
  { id: 1, title: "Monthly Digest - February 2025", date: "Feb 28, 2025", size: "2.4 MB", downloads: 142, file: null },
  { id: 2, title: "Hackathon Edition - January 2025", date: "Jan 31, 2025", size: "1.8 MB", downloads: 231, file: null },
  { id: 3, title: "Year-End Recap 2024", date: "Dec 31, 2024", size: "3.1 MB", downloads: 389, file: null },
];

export default function AdminNewsletters() {
  const [newsletters, setNewsletters] = useState(initialNewsletters);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [form, setForm] = useState({ title: "", file: null });
  const fileRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setForm(f => ({ ...f, file }));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setForm(f => ({ ...f, file }));
  };

  const handleUpload = () => {
    if (!form.title || !form.file) return;
    setUploading(true);
    setTimeout(() => {
      const newNewsletter = {
        id: Date.now(),
        title: form.title,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        size: `${(form.file.size / 1024 / 1024).toFixed(1)} MB`,
        downloads: 0,
        file: form.file,
      };
      setNewsletters(prev => [newNewsletter, ...prev]);
      setForm({ title: "", file: null });
      setUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 1500);
  };

  const handleDelete = (id) => {
    setNewsletters(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="p-8 min-h-screen" style={{ background: "#0d0d0d" }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Newsletter Management</h1>
        <p className="text-[#555] text-sm mt-1">Upload and manage society newsletters for members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Panel */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border p-6" style={{ background: "#111", borderColor: "#1f1f1f" }}>
            <h2 className="text-white font-semibold mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Upload Newsletter
            </h2>

            <div className="mb-4">
              <label className="text-[#666] text-xs mb-1.5 block">Newsletter Title *</label>
              <input
                type="text"
                placeholder="e.g. Monthly Digest - March 2025"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none border focus:border-purple-500 transition-colors"
                style={{ background: "#0d0d0d", borderColor: "#2a2a2a" }}
              />
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
              className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all mb-4"
              style={{
                borderColor: dragOver ? "#a855f7" : form.file ? "#10b981" : "#2a2a2a",
                background: dragOver ? "rgba(168,85,247,0.05)" : form.file ? "rgba(16,185,129,0.05)" : "transparent",
              }}
            >
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
              {form.file ? (
                <>
                  <div className="text-3xl mb-2">📄</div>
                  <p className="text-[#10b981] text-sm font-medium">{form.file.name}</p>
                  <p className="text-[#555] text-xs mt-1">{(form.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <div className="text-3xl mb-2">📤</div>
                  <p className="text-[#888] text-sm">Drop PDF here or click to browse</p>
                  <p className="text-[#444] text-xs mt-1">PDF files only</p>
                </>
              )}
            </div>

            {uploadSuccess && (
              <div className="mb-4 px-3 py-2 rounded-lg text-sm text-center" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                ✓ Newsletter uploaded successfully!
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!form.title || !form.file || uploading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #a855f7, #6366f1)",
                color: "white",
              }}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : "Upload Newsletter"}
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 rounded-xl border p-4" style={{ background: "#111", borderColor: "#1f1f1f" }}>
            <p className="text-[#666] text-xs mb-3">Quick Stats</p>
            <div className="space-y-3">
              {[
                { label: "Total Newsletters", value: newsletters.length },
                { label: "Total Downloads", value: newsletters.reduce((a, b) => a + b.downloads, 0) },
                { label: "Latest Upload", value: newsletters[0]?.date || "None" },
              ].map((s, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-[#555] text-xs">{s.label}</span>
                  <span className="text-white text-xs font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletters List */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border" style={{ background: "#111", borderColor: "#1f1f1f" }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: "#1f1f1f" }}>
              <h2 className="text-white font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                All Newsletters ({newsletters.length})
              </h2>
            </div>
            <div className="divide-y" style={{ borderColor: "#1f1f1f" }}>
              {newsletters.map(n => (
                <div key={n.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#161616] transition-colors">
                  <div
                    className="w-10 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{n.title}</p>
                    <p className="text-[#555] text-xs mt-0.5">{n.date} · {n.size}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0" style={{ background: "#1a1a1a" }}>
                    <span className="text-xs text-[#666]">↓</span>
                    <span className="text-xs text-[#888]">{n.downloads}</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {newsletters.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">📧</p>
                  <p className="text-[#444] text-sm">No newsletters uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
