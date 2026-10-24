import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BlogCard from "../components/blog/BlogCard";
import BlogFilter from "../components/blog/BlogFilter";
import Footer from "../components/layout/Footer";
import api from "../services/api";

function SectionTitle({ title, count }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        marginBottom: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
        <h2
          style={{
            color: "#fff",
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(20px, 4vw, 26px)",
            fontWeight: 400,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h2>
        {typeof count === "number" && (
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
            ({count})
          </span>
        )}
      </div>
      <div
        style={{
          flex: 1,
          height: "1px",
          background: "linear-gradient(90deg, rgba(255,255,255,0.1), transparent)",
        }}
      />
    </div>
  );
}

export default function BlogsPage() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await api.get("/blogs");
        setBlogs(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to load blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Filtered blogs based on Category + Search Query
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      // Category filter
      const matchCategory =
        activeCategory === "All" || blog.category === activeCategory;

      // Search filter (title, description, author, category, or tags)
      if (!searchQuery.trim()) return matchCategory;

      const q = searchQuery.toLowerCase().replace(/^#/, "").trim();
      const matchTitle = (blog.title || "").toLowerCase().includes(q);
      const matchDesc = (blog.description || "").toLowerCase().includes(q);
      const matchAuthor = (blog.author || "").toLowerCase().includes(q);
      const matchCat = (blog.category || "").toLowerCase().includes(q);
      const matchTags = Array.isArray(blog.tags)
        ? blog.tags.some((t) => t.toLowerCase().includes(q))
        : false;

      return (
        matchCategory &&
        (matchTitle || matchDesc || matchAuthor || matchCat || matchTags)
      );
    });
  }, [blogs, activeCategory, searchQuery]);

  // Reset pagination when category or search changes
  useEffect(() => {
    setVisibleCount(9);
  }, [activeCategory, searchQuery]);

  const handleCardClick = (blog) => navigate(`/blog/${blog._id || blog.id}`);

  const visibleBlogs = filteredBlogs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredBlogs.length;

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

      {/* Hero Banner */}
      <section style={{ paddingTop: "clamp(60px, 8vw, 96px)" }}>
        <div
          style={{
            margin: "0 auto",
            maxWidth: "1240px",
            padding: "0 clamp(16px, 4vw, 32px)",
          }}
        >
          <div
            style={{
              borderRadius: "clamp(16px, 3vw, 24px)",
              overflow: "hidden",
              background:
                "linear-gradient(135deg, #111827 0%, #1e1b4b 50%, #312e81 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "clamp(28px, 5vw, 56px) clamp(20px, 4vw, 48px)",
              position: "relative",
              gap: "24px",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: "5%",
                top: "50%",
                transform: "translateY(-50%)",
                width: "240px",
                height: "240px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div style={{ maxWidth: "580px", zIndex: 1 }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 14px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#c7d2fe",
                  marginBottom: "14px",
                }}
              >
                Knowledge &amp; Tech Hub
              </div>
              <h1
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: "clamp(28px, 6vw, 48px)",
                  fontWeight: 400,
                  margin: "0 0 12px",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                  color: "#fff",
                }}
              >
                Ideas, Code &amp; Perspectives
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "clamp(13px, 2.5vw, 15px)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Discover student research, tech breakdowns, startup stories, and
                campus guides curated by the Industry Cell NIT Kurukshetra.
              </p>
            </div>

            <div style={{ zIndex: 1 }}>
              <button
                onClick={() => navigate("/write-blog")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 28px",
                  borderRadius: "999px",
                  background: "#ffffff",
                  color: "#0f172a",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 28px rgba(99,102,241,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(0,0,0,0.4)";
                }}
              >
                <span>✍️ Write an Article</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Category Filter Section */}
      <section
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "clamp(24px, 4vw, 36px) clamp(16px, 4vw, 32px) 0",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            padding: "20px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Search Bar */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              width: "100%",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "16px",
                color: "rgba(255,255,255,0.4)",
                fontSize: "16px",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blogs by title, keywords, author, or #tag..."
              style={{
                width: "100%",
                padding: "13px 44px 13px 44px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
                transition: "border 0.2s ease, background 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid rgba(99,102,241,0.5)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "14px",
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Pills */}
          <BlogFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
      </section>

      {/* Main Content Area: Responsive Grid */}
      <section
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "clamp(30px, 5vw, 48px) clamp(16px, 4vw, 32px)",
        }}
      >
        {/* Title & Active Filter Summary */}
        <SectionTitle
          title={
            searchQuery.trim()
              ? `Search Results for "${searchQuery}"`
              : activeCategory === "All"
              ? "All Publications"
              : activeCategory
          }
          count={filteredBlogs.length}
        />

        {/* Loading Spinner */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "90px 0",
              color: "rgba(255,255,255,0.4)",
              fontSize: "15px",
            }}
          >
            Loading publications...
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBlogs.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "70px 20px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.015)",
              border: "1px dashed rgba(255,255,255,0.1)",
            }}
          >
            <div style={{ fontSize: "44px", marginBottom: "14px" }}>🔍</div>
            <h3
              style={{
                color: "#fff",
                fontSize: "18px",
                fontWeight: 600,
                margin: "0 0 8px",
              }}
            >
              No articles found
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "14px",
                maxWidth: "420px",
                margin: "0 auto 20px",
                lineHeight: 1.6,
              }}
            >
              We couldn't find any articles matching your search query or category
              filter.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              {(searchQuery || activeCategory !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Clear Filters
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate("/write-blog")}
                style={{
                  padding: "10px 20px",
                  borderRadius: "999px",
                  background: "#6366f1",
                  border: "none",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Write an Article
              </button>
            </div>
          </div>
        )}

        {/* Responsive Grid with Cards */}
        {!loading && filteredBlogs.length > 0 && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(clamp(270px, 30vw, 360px), 1fr))",
                gap: "28px",
              }}
            >
              {visibleBlogs.map((blog) => (
                <BlogCard
                  key={blog._id || blog.id}
                  blog={blog}
                  onClick={handleCardClick}
                />
              ))}
            </div>

            {/* Pagination / Load More */}
            {hasMore && (
              <div
                style={{
                  marginTop: "48px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <p
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "13px",
                    margin: 0,
                  }}
                >
                  Showing {visibleBlogs.length} of {filteredBlogs.length} publications
                </p>
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  style={{
                    padding: "12px 32px",
                    borderRadius: "999px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  }}
                >
                  Load More Publications ↓
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
