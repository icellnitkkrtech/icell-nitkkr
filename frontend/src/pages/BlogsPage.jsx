import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BlogCard from "../components/blog/BlogCard";
import BlogFilter from "../components/blog/BlogFilter";
import { useEffect } from "react";
import Footer from "../components/layout/Footer";

// ── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_BLOGS = [
  {
    id: 1,
    title: "What is Positive Pay System and how does it work?",
    description:
      "Understand how the Positive Pay System adds an extra layer of security to cheque transactions in banking.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=475&h=290&fit=crop",
    category: "Finance",
    author: "Arjun Sharma",
    date: "Feb 2026",
    status: "approved",
    content: `## What is Positive Pay System?\n\nThe Positive Pay System is an automated fraud detection mechanism introduced by the Reserve Bank of India (RBI) to add an extra layer of security to high-value cheque transactions.`,
    links: ["https://rbi.org.in", "https://npci.org.in"],
  },
  {
    id: 2,
    title:
      "How to choose the right interest payout frequency for your Fixed Deposits?",
    description:
      "Monthly, quarterly, or at maturity — picking the right FD payout schedule can significantly impact your returns.",
    image:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=475&h=290&fit=crop",
    category: "Technology",
    author: "Priya Menon",
    date: "Feb 2026",
    status: "approved",
    content: `## The Main Difference: Growth vs. Income\n\nBefore you book a Fixed Deposit, ask yourself one question: Will I need the money now, or later?`,
    links: ["https://www.dcbbank.com"],
  },
];

// ── Slider Component ──────────────────────────────────────────────────────────
function BlogSlider({ blogs, onCardClick }) {
  const [startIdx, setStartIdx] = useState(0);
  const visible = 3;
  const canPrev = startIdx > 0;
  const canNext = startIdx + visible < blogs.length;

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          overflow: "hidden",
        }}
      >
        {blogs.slice(startIdx, startIdx + visible).map((blog) => (
          <BlogCard key={blog.id} blog={blog} onClick={onCardClick} />
        ))}
        {Array.from({
          length: Math.max(
            0,
            visible - blogs.slice(startIdx, startIdx + visible).length,
          ),
        }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
      </div>

      {blogs.length > visible && (
        <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
          {[
            {
              label: "← Prev",
              action: () => setStartIdx(Math.max(0, startIdx - 1)),
              enabled: canPrev,
            },
            {
              label: "Next →",
              action: () =>
                setStartIdx(Math.min(blogs.length - visible, startIdx + 1)),
              enabled: canNext,
            },
          ].map(({ label, action, enabled }) => (
            <button
              key={label}
              onClick={action}
              disabled={!enabled}
              style={{
                padding: "9px 22px",
                borderRadius: "999px",
                border: enabled
                  ? "1.5px solid rgba(255,255,255,0.22)"
                  : "1.5px solid rgba(255,255,255,0.07)",
                background: enabled
                  ? "rgba(255,255,255,0.07)"
                  : "rgba(255,255,255,0.02)",
                color: enabled
                  ? "rgba(255,255,255,0.75)"
                  : "rgba(255,255,255,0.18)",
                cursor: enabled ? "pointer" : "not-allowed",
                fontSize: "13px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                transition: "all 0.22s ease",
                backdropFilter: "blur(10px)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        marginBottom: "24px",
      }}
    >
      <h2
        style={{
          color: "#fff",
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: "22px",
          fontWeight: 400,
          margin: 0,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          flex: 1,
          height: "1px",
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)",
        }}
      />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BlogsPage() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlog = async () => {
      const res = await fetch("http://localhost:5000/api/blogs");
      const data = await res.json();
      setBlogs(data);
    };

    fetchBlog();
  }, []);

  // ── CHANGE 1: Use "All" as default to match BlogFilter's first category ──
  const [activeCategory, setActiveCategory] = useState("All");

  // ── CHANGE 2: Filter only uses categories from BlogFilter (All/Finance/Technology/Startup/Design) ──
  // Blogs with categories not in BlogFilter (like "Cyber Security") won't appear
  // under category filter but WILL still appear in "All", "Recent", "Popular" sections.
  // If you want them hidden everywhere, filter MOCK_BLOGS itself at the top.
  const BLOGFILTER_CATEGORIES = [
    "All",
    "Finance",
    "Technology",
    "Startup",
    "Design",
  ];

  const filteredBlogs =
    activeCategory === "All"
      ? blogs
      : blogs.filter((b) => b.category === activeCategory);

  const handleCardClick = (blog) => {
    navigate(`/blog/${blog.id}`);
  };

  const recentBlogs = [...blogs].slice(0, 6);
  const popularBlogs = [...blogs].slice(2, 8);

  // ── CHANGE 3: Section categories now match BlogFilter exactly ──
  // Removed "Cyber Security" — only Finance, Technology, Startup, Design
  const SECTION_CATEGORIES = ["Finance", "Technology", "Startup", "Design"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d0d",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* ── HERO BANNER ── */}
      <section style={{ paddingTop: "96px" }}>
        <div
          style={{ margin: "0 auto", maxWidth: "1200px", padding: "0 24px" }}
        >
          <div
            style={{
              borderRadius: "24px",
              overflow: "hidden",
              background:
                "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              minHeight: "220px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: "10%",
                top: "50%",
                transform: "translateY(-50%)",
                width: 180,
                height: 180,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(102,126,234,0.2) 0%, transparent 70%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "20%",
                top: "20%",
                width: 80,
                height: 80,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(118,75,162,0.25) 0%, transparent 70%)",
              }}
            />
            <div
              style={{
                padding: "48px 56px",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: "16px",
                }}
              >
                Knowledge Hub
              </div>
              <h1
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "clamp(28px, 4vw, 48px)",
                  fontWeight: 400,
                  margin: 0,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  color: "#fff",
                }}
              >
                Trends &amp; Blogs
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "14px",
                  marginTop: "12px",
                  maxWidth: "400px",
                  lineHeight: 1.6,
                }}
              >
                Stay informed with expert insights on finance, technology,
                startup and design.
              </p>
            </div>
            <div
              style={{
                marginLeft: "auto",
                padding: "48px 56px",
                position: "relative",
                zIndex: 1,
              }}
            >
              <button
                onClick={() => navigate("/write-blog")}
                className="relative overflow-hidden px-6 py-3 rounded-[15px] bg-[#e8e8e8] text-[#212121] font-extrabold text-[15px] shadow-[4px_8px_19px_-3px_rgba(0,0,0,0.27)] transition-all duration-300 group flex items-center gap-2"
              >
                <span className="absolute inset-0 w-0 bg-[#212121] rounded-[15px] transition-all duration-300 group-hover:w-full z-0" />
                <span className="relative z-10 flex items-center gap-2 group-hover:text-[#e8e8e8] transition-colors duration-300">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M12 2L14 4L6 12H4V10L12 2Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 14H14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Create Blog
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORY FILTER ── */}
      {/* ── CHANGE 4: Replaced the old inline category buttons with <BlogFilter /> ── */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 24px 0",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* ── THIS IS THE ONLY CHANGE IN THIS SECTION ── */}
          {/* Old code was a manual map over FILTER_CATEGORIES with inline buttons */}
          {/* New code uses your BlogFilter component */}
          <BlogFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
      </section>

      {/* ── FILTERED VIEW (when a specific category is selected) ── */}
      {activeCategory !== "All" && (
        <section
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "40px 24px",
          }}
        >
          <SectionTitle title={activeCategory} />
          {filteredBlogs.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
              }}
            >
              {filteredBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} onClick={handleCardClick} />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                color: "rgba(255,255,255,0.3)",
                fontSize: "15px",
              }}
            >
              No blogs found in this category yet.
            </div>
          )}
        </section>
      )}

      {/* ── ALL SECTIONS (when "All" is selected) ── */}
      {activeCategory === "All" && (
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "40px 24px",
          }}
        >
          <section style={{ marginBottom: "56px" }}>
            <SectionTitle title="Recent Blogs" />
            <BlogSlider blogs={recentBlogs} onCardClick={handleCardClick} />
          </section>

          <section style={{ marginBottom: "56px" }}>
            <SectionTitle title="Most Popular" />
            <BlogSlider blogs={popularBlogs} onCardClick={handleCardClick} />
          </section>

          {/* ── CHANGE 5: Sections now only show Finance/Technology/Startup/Design ── */}
          {/* Removed "Cyber Security" to match BlogFilter categories exactly ── */}
          {SECTION_CATEGORIES.map((cat) => {
            const catBlogs = blogs.filter((b) => b.category === cat);
            if (catBlogs.length === 0) return null;
            return (
              <section key={cat} style={{ marginBottom: "56px" }}>
                <SectionTitle title={cat} />
                <BlogSlider blogs={catBlogs} onCardClick={handleCardClick} />
              </section>
            );
          })}
        </div>
      )}

      <div style={{ height: "60px" }} />
    </div>
  );
}
