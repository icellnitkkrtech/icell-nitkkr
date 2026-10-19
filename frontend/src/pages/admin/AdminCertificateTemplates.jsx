import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Edit2, Plus, Save, Trash2, Upload, X } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const DEFAULT_CANVAS = { width: 1600, height: 1200 };
const FONT_FAMILIES = ["Arial", "Georgia", "Times New Roman", "Montserrat", "Playfair Display", "Great Vibes"];
const ALIGN_TRANSLATE = { left: "0%", center: "-50%", right: "-100%" };
const SYSTEM_EMAIL_FIELD = {
  id: "email",
  label: "Email (required, not displayed)",
  sample: "student@example.com",
  system: true,
  hidden: true,
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const createField = (n) => ({
  id: `field_${n}`,
  label: `Field ${n}`,
  sample: "Sample Text",
  x: 800,
  y: 600,
  maxWidth: 1000,
  autoFit: true,
  fontSize: 48,
  fontFamily: "Arial",
  fontWeight: "normal",
  fontStyle: "normal",
  color: "#000000",
  alignment: "center",
});

const withSystemEmailField = (templateFields = []) => [
  SYSTEM_EMAIL_FIELD,
  ...templateFields.filter((field) => field.id !== SYSTEM_EMAIL_FIELD.id),
];

const inputCls =
  "mt-1 w-full rounded-md border border-[#2a2a2a] bg-[#111] p-2 text-sm text-white outline-none focus:border-[#fbbf24]";

function Labeled({ label, children, className = "" }) {
  return (
    <label className={`block text-xs text-[#999] ${className}`}>
      {label}
      {children}
    </label>
  );
}

export default function AdminCertificateTemplates() {
  const { user, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [background, setBackground] = useState(null);
  const [fields, setFields] = useState([]);
  const [canvasSize, setCanvasSize] = useState(DEFAULT_CANVAS);
  const [previewWidth, setPreviewWidth] = useState(800);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const imageRef = useRef(null);
  const cardRefs = useRef({});
  const dragRef = useRef(null); // { index, pointerId, dx, dy }
  const frameRef = useRef(null);
  const pendingRef = useRef(null); // { index, x, y }

  // ---- auth guard -------------------------------------------------------
  useEffect(() => {
    if (!authLoading && user?.role !== "admin") window.location.replace("/");
  }, [authLoading, user]);

  // ---- data -------------------------------------------------------------
  useEffect(() => {
    if (authLoading || user?.role !== "admin") return;
    api
      .get("/certificate-templates")
      .then((res) => setTemplates(res.data.templates || []))
      .catch(() => setError("Could not load templates"));
  }, [authLoading, user]);

  // ---- object URL lifecycle ---------------------------------------------
  const backgroundPreviewUrl = useMemo(
    () => (background ? URL.createObjectURL(background) : null),
    [background]
  );
  useEffect(() => () => backgroundPreviewUrl && URL.revokeObjectURL(backgroundPreviewUrl), [backgroundPreviewUrl]);
  const imageSrc = backgroundPreviewUrl || editing?.background_url || null;

  // ---- keep preview scale in sync with the rendered image ---------------
  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;
    const update = () => setPreviewWidth(img.clientWidth || 800);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(img);
    return () => observer.disconnect();
  }, [imageSrc]);
  const scale = previewWidth / canvasSize.width;

  const onImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (naturalWidth && naturalHeight) setCanvasSize({ width: naturalWidth, height: naturalHeight });
    setPreviewWidth(event.currentTarget.clientWidth);
  };

  // cancel any queued animation frame on unmount
  useEffect(() => () => frameRef.current && cancelAnimationFrame(frameRef.current), []);

  // ---- actions ----------------------------------------------------------
  const resetForm = useCallback(() => {
    setEditing(null);
    setName("");
    setBackground(null);
    setFields([SYSTEM_EMAIL_FIELD]);
    setSelected(null);
    setCanvasSize(DEFAULT_CANVAS);
    setError("");
  }, []);

  const startEdit = (template) => {
    setEditing(template);
    setName(template.name);
    setBackground(null);
    setFields(withSystemEmailField(template.fields).map((f, i) => ({ ...createField(i + 1), ...f })));
    setSelected(null);
    setCanvasSize({ width: template.canvas_width, height: template.canvas_height });
    setError("");
  };

  const selectBackground = (file) => {
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError("Only PNG or JPEG designs are supported");
      return;
    }
    setError("");
    setBackground(file);
  };

  const updateField = useCallback(
    (index, patch) => setFields((cur) => cur.map((f, i) => (i === index ? { ...f, ...patch } : f))),
    []
  );

  const addField = () => {
    setFields((cur) => [...cur, createField(cur.length + 1)]);
    setSelected(fields.length);
  };

  const removeField = (index) => {
    setFields((cur) => cur.filter((_, i) => i !== index));
    setSelected(null);
  };

  // ---- dragging ---------------------------------------------------------
  const pointerToCanvas = (event) => {
    const image = imageRef.current;
    if (!image) return null;
    const bounds = image.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * canvasSize.width,
      y: ((event.clientY - bounds.top) / bounds.height) * canvasSize.height,
    };
  };

  const flushPending = () => {
    frameRef.current = null;
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    updateField(pending.index, { x: pending.x, y: pending.y });
  };

  const onFieldPointerDown = (event, index) => {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    const point = pointerToCanvas(event);
    if (!point) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const field = fields[index];
    // remember where inside the field we grabbed it -> no jump on press
    dragRef.current = { index, pointerId: event.pointerId, dx: field.x - point.x, dy: field.y - point.y };
    setSelected(index);
    cardRefs.current[index]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  const onFieldPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const point = pointerToCanvas(event);
    if (!point) return;
    pendingRef.current = {
      index: drag.index,
      x: Math.round(clamp(point.x + drag.dx, 0, canvasSize.width)),
      y: Math.round(clamp(point.y + drag.dy, 0, canvasSize.height)),
    };
    if (!frameRef.current) frameRef.current = requestAnimationFrame(flushPending);
  };

  const endDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    flushPending();
    dragRef.current = null;
  };

  const onFieldKeyDown = (event, index) => {
    const step = event.shiftKey ? 10 : 1;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const field = fields[index];
    updateField(index, {
      x: clamp(Math.round(field.x) + move[0], 0, canvasSize.width),
      y: clamp(Math.round(field.y) + move[1], 0, canvasSize.height),
    });
  };

  // ---- save / delete ----------------------------------------------------
  const validate = () => {
    if (!name.trim()) return "Template name is required";
    if (!editing && !background) return "A PNG/JPEG design is required";
    if (fields[0]?.id !== "email" || !fields[0].system) return "The locked email field is required";
    if (!fields.some((field) => !field.system)) return "Add at least one dynamic field";
    const ids = fields.map((f) => f.id.trim());
    if (ids.some((id) => !id)) return "Every field needs a key";
    if (new Set(ids).size !== ids.length) return "Field keys must be unique";
    return "";
  };

  const save = async () => {
    const problem = validate();
    if (problem) return setError(problem);

    setSaving(true);
    setError("");
    try {
      const payload = fields.map(({ sample, ...rest }) => ({
        ...rest,
        id: rest.id.trim(),
        x: Math.round(rest.x),
        y: Math.round(rest.y),
        fontSize: clamp(Number(rest.fontSize) || 48, 1, 300),
        maxWidth: Math.max(0, Number(rest.maxWidth) || 0),
      }));

      const form = new FormData();
      form.append("name", name.trim());
      form.append("fields", JSON.stringify(payload));
      if (background) form.append("background", background);

      const config = { headers: { "Content-Type": "multipart/form-data" } };
      const response = editing
        ? await api.patch(`/certificate-templates/${editing._id}`, form, config)
        : await api.post("/certificate-templates", form, config);

      setTemplates((cur) =>
        editing
          ? cur.map((t) => (t._id === editing._id ? response.data.template : t))
          : [response.data.template, ...cur]
      );
      resetForm();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not save template");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await api.delete(`/certificate-templates/${id}`);
      setTemplates((cur) => cur.filter((t) => t._id !== id));
      if (editing?._id === id) resetForm();
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not delete template");
    }
  };

  if (authLoading || user?.role !== "admin") return null;

  // ---- render -----------------------------------------------------------
  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0d0d] text-white">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8 max-md:pt-20">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Certificate Templates</h1>
            <p className="mt-1 text-[#777]">Admin-managed designs and dynamic fields</p>
          </div>
          <button
            onClick={resetForm}
            className="flex items-center gap-2 rounded-lg bg-[#f59e0b] px-4 py-2 font-semibold text-black"
          >
            <Plus size={18} /> New template
          </button>
        </div>

        {/* template strip */}
        <section className="mb-6 flex gap-3 overflow-x-auto pb-2">
          {templates.map((template) => (
            <article
              key={template._id}
              className={`min-w-[240px] shrink-0 rounded-xl border bg-[#111] p-4 ${
                editing?._id === template._id ? "border-[#fbbf24]/60" : "border-[#252525]"
              }`}
            >
              <h2 className="truncate font-semibold">{template.name}</h2>
              <p className="mt-1 text-xs text-[#777]">
                {template.canvas_width} x {template.canvas_height} · {(template.fields || []).length} fields
              </p>
              <div className="mt-3 flex gap-3">
                <button onClick={() => startEdit(template)} className="flex items-center gap-1 text-sm text-[#fbbf24]">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={() => remove(template._id)} className="flex items-center gap-1 text-sm text-red-400">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </article>
          ))}
          {!templates.length && <p className="text-[#777]">No templates yet.</p>}
        </section>

        {/* editor */}
        <section className="rounded-xl border border-[#252525] bg-[#111] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{editing ? "Edit template" : "Create template"}</h2>
            {editing && (
              <button onClick={resetForm} aria-label="Cancel editing">
                <X />
              </button>
            )}
          </div>

          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Template name"
              className="w-full rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2 md:max-w-md"
            />
            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-[#fbbf24]">
              <Upload size={17} />
              {background ? background.name : editing ? "Replace design (optional)" : "Upload PNG/JPEG design"}
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => selectBackground(e.target.files?.[0])}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            {/* LEFT: sticky preview */}
            <div className="self-start lg:sticky lg:top-4">
              {imageSrc ? (
                <>
                  <div className="relative overflow-hidden border border-[#2a2a2a] bg-white">
                    <img
                      ref={imageRef}
                      src={imageSrc}
                      onLoad={onImageLoad}
                      alt="Certificate design"
                      className="block w-full select-none"
                      draggable={false}
                    />
                    {fields.filter((field) => !field.system).map((field) => {
                      const index = fields.indexOf(field);
                      const boxWidth = field.maxWidth > 0 ? field.maxWidth * scale : undefined;
                      const isSelected = selected === index;
                      return (
                        <div
                          key={index}
                          role="button"
                          tabIndex={0}
                          aria-label={`Move ${field.id}`}
                          onPointerDown={(e) => onFieldPointerDown(e, index)}
                          onPointerMove={onFieldPointerMove}
                          onPointerUp={endDrag}
                          onPointerCancel={endDrag}
                          onFocus={() => setSelected(index)}
                          onKeyDown={(e) => onFieldKeyDown(e, index)}
                          className={`absolute cursor-move touch-none select-none overflow-hidden whitespace-nowrap outline outline-1 outline-dashed ${
                            isSelected ? "bg-amber-400/20 outline-amber-500" : "outline-red-500/70 hover:bg-red-500/10"
                          }`}
                          style={{
                            left: `${field.x * scale}px`,
                            top: `${field.y * scale}px`,
                            width: boxWidth ? `${boxWidth}px` : "auto",
                            transform: `translate(${ALIGN_TRANSLATE[field.alignment]}, -50%)`,
                            textAlign: field.alignment,
                            fontSize: `${field.fontSize * scale}px`,
                            fontFamily: `"${field.fontFamily}", sans-serif`,
                            fontWeight: field.fontWeight,
                            fontStyle: field.fontStyle,
                            color: field.color,
                            lineHeight: 1.1,
                            willChange: "left, top",
                          }}
                        >
                          {field.sample || `{{${field.id}}}`}
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-[#777]">
                    Drag a field to position its anchor. Arrow keys nudge 1px (Shift = 10px). Text is vertically
                    centered on the anchor; alignment decides which edge sits on it.
                  </p>
                </>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-[#2a2a2a] text-sm text-[#666]">
                  Upload a design to see the live preview
                </div>
              )}
            </div>

            {/* RIGHT: field controls */}
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Dynamic fields</h3>
                  <p className="mt-1 text-xs text-[#777]">
                    {fields.length} field{fields.length === 1 ? "" : "s"} · Field key must match a CSV column header.
                  </p>
                </div>
                <button
                  onClick={addField}
                  className="flex items-center gap-1 rounded-lg border border-[#fbbf24]/40 px-3 py-2 text-sm text-[#fbbf24] hover:bg-[#fbbf24]/10"
                >
                  <Plus size={15} /> Add field
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={index}
                    ref={(el) => (cardRefs.current[index] = el)}
                    onClick={() => setSelected(index)}
                    className={`rounded-lg border bg-[#0d0d0d] p-4 ${
                      selected === index ? "border-[#fbbf24]/70" : "border-[#252525]"
                    }`}
                  >
                    <div className="grid grid-cols-2 items-end gap-3">
                      {field.system ? (
                        <div className="col-span-2 rounded-md border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-200">
                          <strong>{field.label}</strong>
                          <p className="mt-1 text-xs text-blue-200/70">
                            The CSV must contain email as its first column. This value links each certificate to a member
                            and is never rendered on the certificate.
                          </p>
                        </div>
                      ) : null}
                      {!field.system ? (
                        <>
                      <Labeled label="Field key (CSV column)">
                        <input
                          value={field.id}
                          onChange={(e) => updateField(index, { id: e.target.value.replace(/[^a-zA-Z0-9_-]/g, "_") })}
                          placeholder="student_name"
                          className={inputCls}
                        />
                      </Labeled>
                      <Labeled label="Preview text">
                        <input
                          value={field.sample}
                          onChange={(e) => updateField(index, { sample: e.target.value })}
                          className={inputCls}
                        />
                      </Labeled>
                      <Labeled label="Font size (px)">
                        <input
                          type="number" min="1" max="300"
                          value={field.fontSize}
                          onChange={(e) => updateField(index, { fontSize: Number(e.target.value) })}
                          className={inputCls}
                        />
                      </Labeled>
                      <Labeled label="Max width (px, 0 = none)">
                        <input
                          type="number" min="0" max={canvasSize.width}
                          value={field.maxWidth}
                          onChange={(e) => updateField(index, { maxWidth: Number(e.target.value) })}
                          className={inputCls}
                        />
                      </Labeled>
                      <Labeled label="Font">
                        <select value={field.fontFamily} onChange={(e) => updateField(index, { fontFamily: e.target.value })} className={inputCls}>
                          {FONT_FAMILIES.map((f) => <option key={f}>{f}</option>)}
                        </select>
                      </Labeled>
                      <Labeled label="Alignment">
                        <select value={field.alignment} onChange={(e) => updateField(index, { alignment: e.target.value })} className={inputCls}>
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </Labeled>
                      <Labeled label="Weight">
                        <select value={field.fontWeight} onChange={(e) => updateField(index, { fontWeight: e.target.value })} className={inputCls}>
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                        </select>
                      </Labeled>
                      <Labeled label="Style">
                        <select value={field.fontStyle} onChange={(e) => updateField(index, { fontStyle: e.target.value })} className={inputCls}>
                          <option value="normal">Normal</option>
                          <option value="italic">Italic</option>
                        </select>
                      </Labeled>
                        </>
                      ) : null}
                    </div>

                    {!field.system ? <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-[#252525] pt-3">
                      <Labeled label="Text color" className="flex items-center gap-2">
                        <input
                          type="color"
                          value={field.color}
                          onChange={(e) => updateField(index, { color: e.target.value })}
                          className="h-7 w-9 cursor-pointer rounded bg-transparent"
                        />
                      </Labeled>
                      <label className="flex items-center gap-2 text-xs text-[#999]">
                        <input
                          type="checkbox"
                          checked={field.autoFit}
                          onChange={(e) => updateField(index, { autoFit: e.target.checked })}
                        />
                        Shrink to fit max width
                      </label>
                      <span className="text-xs text-[#666]">
                        Anchor: {Math.round(field.x)}, {Math.round(field.y)}
                      </span>
                      <button
                        aria-label={`Remove ${field.label || field.id}`}
                        onClick={(e) => { e.stopPropagation(); removeField(index); }}
                        className="ml-auto h-9 rounded-md border border-red-500/30 px-3 text-sm text-red-400 hover:bg-red-500/10"
                      >
                        Remove
                      </button>
                    </div> : null}
                  </div>
                ))}
                {!fields.length && (
                  <p className="rounded-lg border border-dashed border-[#252525] p-6 text-center text-sm text-[#666]">
                    No fields yet. Click “Add field” to place dynamic text on the design.
                  </p>
                )}
              </div>

              {/* sticky save bar */}
              <div className="sticky bottom-0 mt-4 bg-[#111] pb-1 pt-3">
                {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-[#f59e0b] px-5 py-2.5 font-semibold text-black disabled:opacity-50"
                >
                  <Save size={17} /> {saving ? "Saving..." : "Save template"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}