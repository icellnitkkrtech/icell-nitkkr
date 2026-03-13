
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["Accounts", "Cards", "Cyber Security", "Digital Banking", "Fixed Deposit", "Loans", "Payments", "Remittance"];

export default function WriteBlogPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    description: "",
    content: "",
    links: "",
    isMember: "",
    rollNumber: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Clear roll number if user switches away from "yes"
      ...(name === "isMember" && value !== "yes" ? { rollNumber: "" } : {}),
    }));
  };

  const handleImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => handleImage(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleImage(e.dataTransfer.files[0]);
  };

  const handleSubmit = () => {
    if (!form.title || !form.author || !form.category || !form.content) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!form.isMember) {
      alert("Please indicate whether you are a member of the organization.");
      return;
    }
    if (form.isMember === "yes" && !form.rollNumber.trim()) {
      alert("Please enter your Roll Number.");
      return;
    }

    // Payload that would be sent to admin panel
    const payload = {
      ...form,
      coverImage: imagePreview || null,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    console.log("Submitted to admin panel:", payload);

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d0d0d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", maxWidth: 480, padding: "0 24px" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 28,
            }}
          >
            ✓
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 28, color: "#fff", marginBottom: 12 }}>
            Blog Submitted!
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
            Your blog has been submitted for review. It will appear publicly once an admin approves it. Thank you for contributing!
          </p>
          <button
            onClick={() => navigate("/blogs")}
            style={{
              padding: "12px 28px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "border 0.2s",
  };

  const labelStyle = {
    display: "block",
    color: "rgba(255,255,255,0.5)",
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "8px",
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "120px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <button
            onClick={() => navigate("/blogs")}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "6px 14px", borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent", color: "rgba(255,255,255,0.45)",
              fontSize: "12px", cursor: "pointer", marginBottom: "24px",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Back to Blogs
          </button>

          <div
            style={{
              display: "inline-block", padding: "5px 14px", borderRadius: "8px",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "14px",
            }}
          >
            New Post
          </div>

          <h1
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 400,
              color: "#fff",
              margin: "0 0 8px",
              letterSpacing: "-0.02em",
            }}
          >
            Write a Blog
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
            Share your knowledge. Your blog will go live after admin review.
          </p>
        </div>

        {/* Form Card */}
        <div
          style={{
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            padding: "36px",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          {/* Image Upload */}
          <div>
            <label style={labelStyle}>Cover Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              style={{
                borderRadius: "14px",
                border: `1.5px dashed ${dragging ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)"}`,
                background: dragging ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                cursor: "pointer",
                overflow: "hidden",
                transition: "all 0.2s",
                minHeight: imagePreview ? "auto" : "160px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: "100%", maxHeight: "280px", objectFit: "cover", borderRadius: "12px" }} />
              ) : (
                <div style={{ textAlign: "center", padding: "40px 24px" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>🖼️</div>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: "0 0 6px" }}>
                    Drag & drop or click to upload
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", margin: 0 }}>PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileInput} />
            {imagePreview && (
              <button
                onClick={() => setImagePreview(null)}
                style={{
                  marginTop: "8px", fontSize: "12px",
                  color: "rgba(255,255,255,0.3)", background: "none",
                  border: "none", cursor: "pointer", padding: 0,
                }}
              >
                Remove image
              </button>
            )}
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>Title <span style={{ color: "rgba(255,100,100,0.8)" }}>*</span></label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter a compelling blog title..."
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.25)")}
              onBlur={e => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)")}
            />
          </div>

          {/* Author + Category row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Author Name <span style={{ color: "rgba(255,100,100,0.8)" }}>*</span></label>
              <input
                name="author"
                value={form.author}
                onChange={handleChange}
                placeholder="Your name"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.25)")}
                onBlur={e => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)")}
              />
            </div>
            <div>
              <label style={labelStyle}>Category <span style={{ color: "rgba(255,100,100,0.8)" }}>*</span></label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={{ ...inputStyle, appearance: "none" }}
                onFocus={e => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.25)")}
                onBlur={e => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)")}
              >
                <option value="" style={{ background: "#1a1a1a" }}>Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} style={{ background: "#1a1a1a" }}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Member of Organization ── */}
          <div>
            <label style={labelStyle}>
              Member of Organization <span style={{ color: "rgba(255,100,100,0.8)" }}>*</span>
            </label>

            {/* Toggle pill buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { value: "yes", label: "Yes, I'm a member" },
                { value: "no",  label: "No, I'm not" },
              ].map(({ value, label }) => {
                const active = form.isMember === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleChange({ target: { name: "isMember", value } })}
                    style={{
                      padding: "10px 22px",
                      borderRadius: "999px",
                      border: active
                        ? "1px solid rgba(255,255,255,0.4)"
                        : "1px solid rgba(255,255,255,0.1)",
                      background: active
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(255,255,255,0.03)",
                      color: active ? "#fff" : "rgba(255,255,255,0.4)",
                      fontSize: "13px",
                      fontWeight: active ? 500 : 400,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "all 0.2s",
                    }}
                  >
                    {active && (
                      <span style={{ marginRight: "6px", fontSize: "11px", opacity: 0.8 }}>✓</span>
                    )}
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Conditional Roll Number field */}
            {form.isMember === "yes" && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "18px 20px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.03)",
                  animation: "fadeSlideIn 0.22s ease",
                }}
              >
                <style>{`
                  @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                  }
                `}</style>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "14px",
                  }}
                >
                  <span
                    style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "rgba(120,220,140,0.7)",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: "rgba(120,220,140,0.8)", fontSize: "12px", fontWeight: 500, letterSpacing: "0.04em" }}>
                    Organization member verified
                  </span>
                </div>

                <label style={labelStyle}>
                  Roll Number <span style={{ color: "rgba(255,100,100,0.8)" }}>*</span>
                </label>
                <input
                  name="rollNumber"
                  value={form.rollNumber}
                  onChange={handleChange}
                  placeholder="e.g. ORG-2024-00123"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.25)")}
                  onBlur={e => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)")}
                />
                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", marginTop: "6px", marginBottom: 0 }}>
                  Your roll number will be sent to the admin for identity verification.
                </p>
              </div>
            )}
          </div>
          {/* ── End Member of Organization ── */}

          {/* Short Description */}
          <div>
            <label style={labelStyle}>Short Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="A brief summary that appears on the blog card (2–3 sentences)..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              onFocus={e => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.25)")}
              onBlur={e => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)")}
            />
          </div>

          {/* Full Content */}
          <div>
            <label style={labelStyle}>Full Content <span style={{ color: "rgba(255,100,100,0.8)" }}>*</span></label>
            <div
              style={{
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex", gap: "6px", padding: "10px 12px",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  flexWrap: "wrap",
                }}
              >
                {["H1", "H2", "H3", "B", "I", "Link", "• List"].map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "3px 10px", borderRadius: "6px", fontSize: "11px",
                      fontWeight: 600, cursor: "pointer",
                      background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      fontFamily: "monospace",
                    }}
                  >
                    {t}
                  </span>
                ))}
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", marginLeft: "auto", alignSelf: "center" }}>
                  Rich editor coming soon
                </span>
              </div>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder={`Write your full blog content here...\n\n## Introduction\nStart with a compelling introduction...\n\n## Main Section\nAdd your headings and content...\n\n## Conclusion\nWrap up with key takeaways...`}
                rows={14}
                style={{
                  ...inputStyle,
                  border: "none",
                  borderRadius: 0,
                  background: "transparent",
                  resize: "vertical",
                  lineHeight: 1.8,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>
          </div>

          {/* Links */}
          <div>
            <label style={labelStyle}>Related Links</label>
            <input
              name="links"
              value={form.links}
              onChange={handleChange}
              placeholder="https://example.com, https://another.com"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.25)")}
              onBlur={e => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)")}
            />
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", marginTop: "6px" }}>
              Separate multiple links with commas
            </p>
          </div>

          {/* Admin notice */}
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "12px",
              background: "rgba(255,200,0,0.05)",
              border: "1px solid rgba(255,200,0,0.12)",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>⏳</span>
            <p style={{ color: "rgba(255,200,0,0.6)", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>
              Your blog will be <strong style={{ color: "rgba(255,200,0,0.8)" }}>reviewed by an admin</strong> before going live.
              {form.isMember === "yes" && form.rollNumber && (
                <> Your membership (Roll No: <strong style={{ color: "rgba(255,200,0,0.8)" }}>{form.rollNumber}</strong>) will also be verified.</>
              )}
              {" "}This usually takes 24–48 hours.
            </p>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              onClick={() => navigate("/blogs")}
              style={{
                padding: "12px 24px", borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent", color: "rgba(255,255,255,0.45)",
                fontSize: "14px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              style={{
                padding: "12px 32px", borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff", fontSize: "14px", fontWeight: 500,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.18)";
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.45)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.3)";
              }}
            >
              Submit for Review →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}







