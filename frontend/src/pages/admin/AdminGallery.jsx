import { useState, useRef } from "react";

const initialPhotos = [
  { id: 1, title: "Hackathon 2025", event: "Hackathon", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80" },
  { id: 2, title: "WebDev Workshop", event: "Workshop", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80" },
  { id: 3, title: "Open Source Sprint", event: "Sprint", image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&q=80" },
  { id: 4, title: "Team Meeting", event: "Internal", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80" },
  { id: 5, title: "Annual Fest", event: "Fest", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80" },
  { id: 6, title: "Award Ceremony", event: "Ceremony", image: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=400&q=80" },
];

const eventTags = ["All", "Hackathon", "Workshop", "Sprint", "Internal", "Fest", "Ceremony"];

export default function AdminGallery() {
  const [photos, setPhotos] = useState(initialPhotos);
  const [filter, setFilter] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ title: "", event: "", imageUrl: "", file: null });
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const filtered = filter === "All" ? photos : photos.filter(p => p.event === filter);

  const handleFileSelect = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setForm(f => ({ ...f, file, imageUrl: e.target.result }));
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!form.title || !form.imageUrl) return;
    const newPhoto = {
      id: Date.now(),
      title: form.title,
      event: form.event || "Other",
      image: form.imageUrl,
    };
    setPhotos(prev => [newPhoto, ...prev]);
    setForm({ title: "", event: "", imageUrl: "", file: null });
    setShowUpload(false);
  };

  const deletePhoto = (id) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const exportJSON = () => {
    const data = photos.map(({ id, title, event, image }) => ({ id, title, event, image_url: image }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "gallery.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 min-h-screen" style={{ background: "#0d0d0d" }}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(e.target.files[0])} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Gallery Management</h1>
          <p className="text-[#555] text-sm mt-1">Manage event photos for the gallery page</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportJSON}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            style={{ background: "#1a1a1a", color: "#888", border: "1px solid #2a2a2a" }}
          >
            ↓ Export JSON
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", color: "white" }}
          >
            + Upload Photo
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {eventTags.map(tag => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: filter === tag ? "rgba(168,85,247,0.15)" : "#111",
              color: filter === tag ? "#a855f7" : "#666",
              border: `1px solid ${filter === tag ? "rgba(168,85,247,0.3)" : "#1f1f1f"}`,
            }}
          >
            {tag} {tag === "All" ? `(${photos.length})` : `(${photos.filter(p => p.event === tag).length})`}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(photo => (
          <div
            key={photo.id}
            className="group relative rounded-xl overflow-hidden border transition-all hover:border-[#2a2a2a] cursor-pointer"
            style={{ background: "#111", borderColor: "#1f1f1f", aspectRatio: "4/3" }}
            onClick={() => setPreview(photo)}
          >
            <img src={photo.image} alt={photo.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3"
              style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.8))" }}
            >
              <p className="text-white text-sm font-medium">{photo.title}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(168,85,247,0.3)", color: "#d8b4fe" }}>
                  {photo.event}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); deletePhoto(photo.id); }}
                  className="text-xs px-2 py-0.5 rounded-lg"
                  style={{ background: "rgba(239,68,68,0.3)", color: "#fca5a5" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Upload tile */}
        <div
          onClick={() => setShowUpload(true)}
          className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-purple-500 hover:bg-purple-500/5"
          style={{ borderColor: "#2a2a2a", aspectRatio: "4/3" }}
        >
          <span className="text-3xl mb-2 text-[#333]">+</span>
          <span className="text-[#444] text-xs">Add Photo</span>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🖼️</p>
          <p className="text-[#444] text-sm">No photos in this category</p>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.9)" }} onClick={() => setPreview(null)}>
          <div className="max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <img src={preview.image} alt={preview.title} className="w-full rounded-xl" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{preview.title}</p>
                <span className="text-xs text-[#a855f7]">{preview.event}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { deletePhoto(preview.id); setPreview(null); }} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                  Delete
                </button>
                <button onClick={() => setPreview(null)} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: "#1a1a1a", color: "#666" }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }} onClick={() => setShowUpload(false)}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#111", border: "1px solid #2a2a2a" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-semibold text-lg mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Upload Photo</h3>
            <div className="space-y-4">
              {/* Drop Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current.click()}
                className="rounded-xl border-2 border-dashed cursor-pointer transition-all overflow-hidden"
                style={{ borderColor: dragOver ? "#a855f7" : "#2a2a2a", height: "180px" }}
              >
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-3xl mb-2">📸</span>
                    <span className="text-[#555] text-sm">Click or drag to upload image</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[#666] text-xs mb-1.5 block">Photo Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Hackathon 2025 Opening" className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none border" style={{ background: "#0d0d0d", borderColor: "#2a2a2a" }} />
              </div>
              <div>
                <label className="text-[#666] text-xs mb-1.5 block">Event Tag</label>
                <select value={form.event} onChange={e => setForm(f => ({ ...f, event: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none border" style={{ background: "#0d0d0d", borderColor: "#2a2a2a" }}>
                  <option value="">Select event...</option>
                  {eventTags.filter(t => t !== "All").map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleUpload} disabled={!form.title || !form.imageUrl} className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40" style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", color: "white" }}>
                Upload Photo
              </button>
              <button onClick={() => { setShowUpload(false); setForm({ title: "", event: "", imageUrl: "", file: null }); }} className="px-4 py-2.5 rounded-lg text-sm" style={{ background: "#1a1a1a", color: "#666" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
