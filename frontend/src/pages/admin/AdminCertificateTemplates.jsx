import { useEffect, useRef, useState } from "react";
import { Edit2, Plus, Save, Trash2, Upload, X } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const emptyField = { id: "name", label: "Name", x: 100, y: 100, maxWidth: 0, fontSize: 48, fontFamily: "Arial", fontWeight: "normal", fontStyle: "normal", color: "#000000", alignment: "center" };

export default function AdminCertificateTemplates() {
  const { user, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [background, setBackground] = useState(null);
  const [fields, setFields] = useState([]);
  const [canvasSize, setCanvasSize] = useState({ width: 1600, height: 1200 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const imageRef = useRef(null);

  const load = async () => setTemplates((await api.get("/certificate-templates")).data.templates || []);
  useEffect(() => { load().catch(() => setError("Could not load templates")); }, []);
  useEffect(() => { if (!authLoading && user?.role !== "admin") window.location.replace("/"); }, [authLoading, user]);

  const startCreate = () => { setEditing(null); setName(""); setBackground(null); setFields([]); setCanvasSize({ width: 1600, height: 1200 }); setError(""); };
  const startEdit = (template) => { setEditing(template); setName(template.name); setBackground(null); setFields(template.fields || []); setCanvasSize({ width: template.canvas_width, height: template.canvas_height }); setError(""); };
  const selectBackground = (file) => {
    setBackground(file || null);
    if (!file) return;
    const image = new Image();
    image.onload = () => setCanvasSize({ width: image.naturalWidth, height: image.naturalHeight });
    image.src = URL.createObjectURL(file);
  };
  const updateField = (index, patch) => setFields((current) => current.map((field, fieldIndex) => fieldIndex === index ? { ...field, ...patch } : field));
  const addField = () => setFields((current) => [...current, { ...emptyField, id: `field_${current.length + 1}`, label: `Field ${current.length + 1}` }]);

  const save = async () => {
    if (!name.trim() || (!editing && !background)) { setError("Name and a PNG/JPEG design are required"); return; }
    setSaving(true); setError("");
    try {
      const form = new FormData(); form.append("name", name.trim()); form.append("fields", JSON.stringify(fields));
      if (background) form.append("background", background);
      const response = editing ? await api.patch(`/certificate-templates/${editing._id}`, form, { headers: { "Content-Type": "multipart/form-data" } }) : await api.post("/certificate-templates", form, { headers: { "Content-Type": "multipart/form-data" } });
      setTemplates((current) => editing ? current.map((item) => item._id === editing._id ? response.data.template : item) : [response.data.template, ...current]);
      startCreate();
    } catch (requestError) { setError(requestError.response?.data?.error || "Could not save template"); }
    finally { setSaving(false); }
  };

  const remove = async (id) => { if (!window.confirm("Delete this template?")) return; await api.delete(`/certificate-templates/${id}`); setTemplates((current) => current.filter((item) => item._id !== id)); };
  const previewWidth = imageRef.current?.clientWidth || 800;
  const canvasWidth = canvasSize.width;
  const scale = previewWidth / canvasWidth;

  return <div className="flex min-h-screen bg-[#0d0d0d] text-white"><AdminSidebar /><main className="flex-1 overflow-auto p-6 md:p-8 max-md:pt-20">
    <div className="flex items-center justify-between mb-8"><div><h1 className="text-3xl font-bold">Certificate Templates</h1><p className="text-[#777] mt-1">Admin-managed designs and dynamic fields</p></div><button onClick={startCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f59e0b] text-black font-semibold"><Plus size={18} /> New template</button></div>
    <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
      <section className="space-y-3">{templates.map((template) => <article key={template._id} className="rounded-xl border border-[#252525] bg-[#111] p-4"><h2 className="font-semibold">{template.name}</h2><p className="text-xs text-[#777] mt-1">{template.canvas_width} x {template.canvas_height} · {(template.fields || []).length} fields</p><div className="flex gap-2 mt-4"><button onClick={() => startEdit(template)} className="flex items-center gap-1 text-sm text-[#fbbf24]"><Edit2 size={14} /> Edit</button><button onClick={() => remove(template._id)} className="flex items-center gap-1 text-sm text-red-400"><Trash2 size={14} /> Delete</button></div></article>)}{!templates.length && <p className="text-[#777]">No templates yet.</p>}</section>
      <section className="rounded-xl border border-[#252525] bg-[#111] p-5"><div className="flex justify-between items-center mb-5"><h2 className="text-xl font-semibold">{editing ? "Edit template" : "Create template"}</h2>{editing && <button onClick={startCreate}><X /></button>}</div><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Template name" className="w-full mb-4 rounded-lg bg-[#0d0d0d] border border-[#2a2a2a] px-3 py-2" /><label className="flex items-center gap-2 w-fit cursor-pointer text-sm text-[#fbbf24] mb-4"><Upload size={17} /> {background ? background.name : editing ? "Replace design (optional)" : "Upload PNG/JPEG design"}<input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(event) => selectBackground(event.target.files?.[0])} /></label>
        {(editing?.background_url || background) && <div className="relative border border-[#2a2a2a] bg-white overflow-hidden"><img ref={imageRef} src={background ? URL.createObjectURL(background) : editing.background_url} alt="Certificate design" className="block w-full" />{fields.map((field) => <div key={field.id} className="absolute border border-red-500 text-red-600 text-xs pointer-events-none" style={{ left: `${field.x * scale}px`, top: `${field.y * scale}px`, fontSize: `${Math.max(8, field.fontSize * scale)}px`, transform: "translateY(-100%)" }}>{`{{${field.id}}}`}</div>)}</div>}
        <div className="flex justify-between items-center mt-5"><h3 className="font-semibold">Dynamic fields</h3><button onClick={addField} className="text-sm text-[#fbbf24]">+ Add field</button></div><div className="space-y-3 mt-3">{fields.map((field, index) => <div key={`${field.id}-${index}`} className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-lg border border-[#252525] p-3"><input value={field.id} onChange={(event) => updateField(index, { id: event.target.value.replace(/[^a-zA-Z0-9_-]/g, "_") })} placeholder="field_id" className="bg-[#0d0d0d] p-2 rounded" /><input value={field.label} onChange={(event) => updateField(index, { label: event.target.value })} placeholder="Label" className="bg-[#0d0d0d] p-2 rounded" /><input type="number" value={field.x} onChange={(event) => updateField(index, { x: Number(event.target.value) })} placeholder="X" className="bg-[#0d0d0d] p-2 rounded" /><input type="number" value={field.y} onChange={(event) => updateField(index, { y: Number(event.target.value) })} placeholder="Y" className="bg-[#0d0d0d] p-2 rounded" /><input type="number" value={field.fontSize} onChange={(event) => updateField(index, { fontSize: Number(event.target.value) })} placeholder="Font size" className="bg-[#0d0d0d] p-2 rounded" /><select value={field.alignment} onChange={(event) => updateField(index, { alignment: event.target.value })} className="bg-[#0d0d0d] p-2 rounded"><option>left</option><option>center</option><option>right</option></select><input type="color" value={field.color} onChange={(event) => updateField(index, { color: event.target.value })} className="h-10 bg-[#0d0d0d] rounded" /><button onClick={() => setFields((current) => current.filter((_, fieldIndex) => fieldIndex !== index))} className="text-red-400 text-sm">Remove</button></div>)}</div>{error && <p className="text-red-400 text-sm mt-4">{error}</p>}<button onClick={save} disabled={saving} className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#f59e0b] text-black font-semibold disabled:opacity-50"><Save size={17} /> {saving ? "Saving..." : "Save template"}</button>
      </section></div>
  </main></div>;
}
