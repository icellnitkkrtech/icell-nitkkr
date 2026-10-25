
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "../components/layout/Footer";
import api from "../services/api";
import { getOptimizedCloudinaryUrl, CLOUDINARY_PRESETS } from "../utils/cloudinary";
import MarkdownRenderer from "../components/blog/MarkdownRenderer";
import { Mail } from "lucide-react";




// ── Share button ──────────────────────────────────────────────────────────────
function ShareButton({ icon, label, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow noreferrer"
      title={label}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 36, height: 36, borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.6)",
        textDecoration: "none", transition: "all 0.2s", fontSize: "14px",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.12)";
        e.currentTarget.style.color = "#fff";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        e.currentTarget.style.color = "rgba(255,255,255,0.6)";
      }}
    >
      {icon}
    </a>
  );
}

// ── Related blog card ─────────────────────────────────────────────────────────
function RelatedCard({ blog, onClick }) {
  return (
    <div
      onClick={() => onClick(blog)}
      style={{
        cursor: "pointer", borderRadius: "14px", overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        transition: "all 0.25s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.16)";
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
      }}
    >
      {blog.image ? (
        <img
          src={getOptimizedCloudinaryUrl(blog.image, CLOUDINARY_PRESETS.thumbnail) || blog.image} alt={blog.title}
          style={{ width: "100%", height: "130px", objectFit: "cover" }}
        />
      ) : (
        <div style={{
          width: "100%", height: "130px", background: "#1a1a1a",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "28px",
        }}>📝</div>
      )}
      <div style={{ padding: "14px" }}>
        <span style={{
          fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
        }}>
          {blog.category}
        </span>
        <p style={{
          color: "#fff", fontSize: "13px",
          fontFamily: "'DM Serif Display', Georgia, serif",
          lineHeight: 1.4, margin: "6px 0 8px",
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {blog.title}
        </p>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", margin: 0 }}>
          {blog.author} · {blog.date}
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog]           = useState(null);
  const [allBlogs, setAllBlogs]   = useState([]);
  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        const response = await api.get(`/blogs/${id}`);
        setBlog(response.data);

        const allResponse = await api.get("/blogs");
        setAllBlogs(Array.isArray(allResponse.data) ? allResponse.data : []);
      } catch (err) {
        console.error(err);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0d0d0d",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>Loading…</p>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!blog) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0d0d0d",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
          <h2 style={{ color: "#fff", fontSize: "22px", marginBottom: "8px" }}>Blog not found</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "24px" }}>
            The blog you're looking for doesn't exist or was removed.
          </p>
          <button
            onClick={() => navigate("/blogs")}
            style={{
              padding: "10px 24px", borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)", color: "#fff",
              cursor: "pointer", fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const currentBlogId = blog._id || blog.id;
  const related = allBlogs
    .filter(b => (b._id || b.id) !== currentBlogId && b.category === blog.category)
    .slice(0, 3);

  const moreBlogs = related.length < 3
    ? [...related, ...allBlogs.filter(b => (b._id || b.id) !== currentBlogId && b.category !== blog.category)].slice(0, 3)
    : related;

  const linksArray = blog.links
    ? blog.links.split(",").map(l => l.trim()).filter(Boolean)
    : [];

  const tableOfContents = (blog.content || "")
    .split("\n")
    .filter(line => line.startsWith("## "))
    .map((line, i) => ({ id: `section-${i}`, label: line.replace("## ", "") }));

  const shareUrl   = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(blog.title || "");

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0d0d0d] text-white" style={{
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── HERO ── */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-4">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">

          {/* Back button */}
          <button
            onClick={() => navigate("/blogs")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs mb-6 transition cursor-pointer font-sans"
          >
            ← Back to Blogs
          </button>

          {/* Hero card */}
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#111] grid grid-cols-1 lg:grid-cols-2 min-h-[320px] shadow-2xl">
            {/* Left: meta */}
            <div className="p-5 sm:p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-[#141414] to-[#1a1a2e] order-2 lg:order-1">
              <div className="flex items-center gap-2 sm:gap-2.5 mb-4 sm:mb-5 flex-wrap">
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-white/10 border border-white/15 text-white/90">
                  {blog.category}
                </span>
                <span className="text-white/40 text-xs">
                  {blog.date}
                </span>
                <span className="text-sky-400 text-xs bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  🕒 {blog.read_time || Math.max(1, Math.ceil((blog.content || "").split(/\s+/).filter(Boolean).length / 120))} min read
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-white mb-4 sm:mb-5 leading-tight tracking-tight">
                {blog.title}
              </h1>

              {/* Author */}
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md">
                  {blog.author?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white text-xs sm:text-sm font-medium m-0 truncate">
                      {blog.author}
                    </p>
                    {blog.author_email && (
                      <a
                        href={`mailto:${blog.author_email}`}
                        title="Contact author via email"
                        className="inline-flex items-center gap-1 text-indigo-400 text-[11px] no-underline px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition truncate max-w-full"
                      >
                        <Mail size={11} className="shrink-0" />
                        <span className="truncate">{blog.author_email}</span>
                      </a>
                    )}
                  </div>
                  <p className="text-white/40 text-[11px] mt-0.5">
                    {blog.author_role ? `${blog.author_role} · ` : ""}Author · {blog.date}
                  </p>
                </div>
              </div>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                  {blog.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Share */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white/30 text-xs mr-1">
                  Share:
                </span>
                <ShareButton
                  icon="𝕏" label="Share on X"
                  href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                />
                <ShareButton
                  icon="in" label="Share on LinkedIn"
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`}
                />
                <ShareButton
                  icon="f" label="Share on Facebook"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                />
              </div>
            </div>

            {/* Right: image */}
            <div className="relative overflow-hidden w-full h-56 sm:h-72 lg:h-full min-h-[220px] lg:min-h-[320px] order-1 lg:order-2">
              {blog.image ? (
                <img
                  src={getOptimizedCloudinaryUrl(blog.image, CLOUDINARY_PRESETS.lightbox) || blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full min-h-[220px] lg:min-h-[320px] bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] flex items-center justify-center text-5xl sm:text-6xl">
                  📝
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/60 lg:from-[#141414]/50 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT + SIDEBAR ── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-8 lg:gap-12 items-start">

          {/* Article */}
          <article className="min-w-0 max-w-full">
            {/* Description highlight */}
            {blog.description && (
              <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-8 bg-white/[0.03] border border-white/10 border-l-4 border-l-indigo-400">
                <p className="text-white/80 text-base sm:text-lg leading-relaxed italic m-0">
                  {blog.description}
                </p>
              </div>
            )}

            {/* Full content with MarkdownRenderer */}
            <MarkdownRenderer content={blog.content} />

            {/* Related links */}
            {linksArray.length > 0 && (
              <div className="mt-8 p-4 sm:p-6 rounded-xl bg-white/[0.03] border border-white/10">
                <p className="text-white/50 text-xs font-semibold tracking-wider uppercase mb-3">
                  Related Links
                </p>
                <div className="flex flex-col gap-2">
                  {linksArray.map((link, i) => (
                    <a
                      key={i} href={link} target="_blank" rel="noreferrer"
                      className="text-white/60 hover:text-white text-xs sm:text-sm flex items-center gap-1.5 transition break-all"
                    >
                      <span className="text-[10px]">↗</span> {link}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-8 p-4 sm:p-5 rounded-xl bg-amber-500/[0.04] border border-amber-500/20">
              <p className="text-amber-400/80 text-[11px] font-semibold tracking-wider uppercase mb-1.5">
                Disclaimer
              </p>
              <p className="text-white/40 text-xs leading-relaxed m-0">
                Information on this page is for informational purposes only and does not
                constitute professional advice. Readers are advised to consult professionals
                for personalised advice before making decisions.
              </p>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:sticky lg:top-24 space-y-5">

            {/* Table of contents */}
            {tableOfContents.length > 0 && (
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <p className="text-white/50 text-[11px] font-semibold tracking-widest uppercase mb-3.5">
                  Table of Contents
                </p>
                <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                  {tableOfContents.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSection(i)}
                      className={`text-left px-3 py-2 rounded-lg text-xs sm:text-sm leading-snug transition font-sans cursor-pointer ${
                        activeSection === i
                          ? "bg-white/10 text-white font-medium border-l-2 border-indigo-400 pl-2.5"
                          : "text-white/50 hover:text-white/80 border-l-2 border-transparent"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Author card */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <p className="text-white/40 text-[11px] font-semibold tracking-widest uppercase mb-3.5">
                About the Author
              </p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-base font-bold text-white shrink-0 shadow-md">
                  {blog.author?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-semibold m-0 truncate">
                    {blog.author}
                  </p>
                  <p className="text-white/45 text-xs mt-0.5 truncate">
                    {blog.author_role || "Student"}
                  </p>
                </div>
              </div>

              {blog.author_email && (
                <div className="mt-3.5 pt-3 border-t border-white/10">
                  <a
                    href={`mailto:${blog.author_email}`}
                    title={`Contact ${blog.author} (${blog.author_email})`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 text-xs font-medium transition overflow-hidden"
                  >
                    <Mail size={13} className="shrink-0" />
                    <span className="truncate">{blog.author_email}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Share card */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <p className="text-white/40 text-[11px] font-semibold tracking-widest uppercase mb-3.5">
                Share this Post
              </p>
              <div className="flex gap-2">
                <ShareButton
                  icon="𝕏" label="Share on X"
                  href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                />
                <ShareButton
                  icon="in" label="Share on LinkedIn"
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}`}
                />
                <ShareButton
                  icon="f" label="Share on Facebook"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                />
              </div>
            </div>

          </aside>
        </div>
      </section>

      {/* ── RELATED BLOGS ── */}
      {moreBlogs.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-white font-serif text-xl sm:text-2xl font-normal m-0 tracking-tight">
              You Might Also Like
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/15 to-transparent" />
            <button
              onClick={() => navigate("/blogs")}
              className="text-white/40 hover:text-white text-xs bg-transparent border-0 cursor-pointer font-sans whitespace-nowrap transition"
            >
              View all →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {moreBlogs.map(b => (
              <RelatedCard
                key={b._id || b.id}
                blog={b}
                onClick={() => navigate(`/blog/${b._id || b.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
