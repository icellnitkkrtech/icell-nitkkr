

import { useState } from "react";

const initialBlogs = [
  {
    id: 1,
    title: "Introduction to Machine Learning",
    author: "Rahul Sharma",
    category: "Tech",
    status: "pending",
    date: "Mar 5, 2025",
    isMember: "yes",
    rollNumber: "ORG-2024-00101",
    description: "A beginner's guide to ML concepts, covering supervised and unsupervised learning with practical examples.",
    content: `## Introduction
Machine learning is a subset of artificial intelligence that allows systems to learn and improve from experience without being explicitly programmed.

## Supervised Learning
In supervised learning, the algorithm is trained on labeled data. For example, given a dataset of emails labeled "spam" or "not spam", the model learns to classify new emails.

**Common algorithms:**
- Linear Regression
- Decision Trees
- Support Vector Machines

## Unsupervised Learning
Unsupervised learning deals with unlabeled data. The algorithm tries to find hidden patterns or groupings on its own.

**Common algorithms:**
- K-Means Clustering
- Principal Component Analysis (PCA)

## Conclusion
Machine learning is transforming every industry. Starting with the basics of supervised and unsupervised learning is the best way to enter this exciting field.`,
    links: "https://scikit-learn.org, https://kaggle.com",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80",
  },
  {
    id: 2,
    title: "Hackathon 2025 Recap",
    author: "Priya Mehta",
    category: "Events",
    status: "approved",
    date: "Mar 3, 2025",
    isMember: "yes",
    rollNumber: "ORG-2024-00045",
    description: "An exciting recap of our annual hackathon where 200+ students competed over 36 hours.",
    content: `## Overview
This year's hackathon was our biggest yet, with over 200 students from 15 colleges participating across 36 intense hours of building, designing, and pitching.

## Highlights
The event kicked off with an inspiring keynote from our chief guest, followed by team formation and problem statement reveals. Teams tackled challenges in healthcare, fintech, and sustainability.

## Winners
- **1st Place:** Team Nexus — AI-powered healthcare triage app
- **2nd Place:** Team Pixel — Sustainable supply chain tracker
- **3rd Place:** Team Orbit — Micro-investment platform for students

## What's Next
We're already planning Hackathon 2026. Stay tuned for early registrations!`,
    links: "https://devfolio.co",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
  },
  {
    id: 3,
    title: "Open Source Contribution Guide",
    author: "Aman Verma",
    category: "Tech",
    status: "pending",
    date: "Mar 4, 2025",
    isMember: "no",
    rollNumber: "",
    description: "Step-by-step guide on how to contribute to open source projects on GitHub.",
    content: `## Why Contribute to Open Source?
Open source contributions help you grow as a developer, build your portfolio, and collaborate with engineers worldwide.

## Step 1: Find a Project
Start with projects you already use. Look for issues labeled "good first issue" or "help wanted" on GitHub.

## Step 2: Fork & Clone
Fork the repository to your account, then clone it locally:
\`\`\`
git clone https://github.com/your-username/project-name.git
\`\`\`

## Step 3: Make Your Changes
Create a new branch, make your changes, and write clear commit messages.

## Step 4: Open a Pull Request
Push your branch and open a PR with a clear title and description explaining what you changed and why.

## Conclusion
Your first contribution is always the hardest. After that, it gets addictive!`,
    links: "https://github.com, https://firstcontributions.github.io",
    image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80",
  },
  {
    id: 4,
    title: "Campus Life as a Developer",
    author: "Sneha Roy",
    category: "Life",
    status: "rejected",
    date: "Mar 1, 2025",
    isMember: "yes",
    rollNumber: "ORG-2024-00078",
    description: "Balancing college academics, side projects, and social life as a CS student.",
    content: `## The Struggle Is Real
Being a CS student means constantly juggling assignments, coding projects, internship prep, and somehow still trying to have a social life.

## Time Management Tips
The key is ruthless prioritization. Use a simple system: pick your top 3 tasks each morning and commit to finishing them before anything else.

## Side Projects
Side projects are your best portfolio pieces. Even small projects like a personal finance tracker or a recipe app teach you more than any tutorial.

## Don't Forget to Rest
Burnout is real. Schedule offline time, exercise, and sleep like you schedule your coding sessions.

## Conclusion
Campus life as a developer is challenging but incredibly rewarding. Embrace the chaos — it shapes you.`,
    links: "",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
  },
  {
    id: 5,
    title: "Web3 for Beginners",
    author: "Karan Gupta",
    category: "Tech",
    status: "pending",
    date: "Mar 5, 2025",
    isMember: "no",
    rollNumber: "",
    description: "Demystifying blockchain, smart contracts, and decentralized applications.",
    content: `## What Is Web3?
Web3 represents the next generation of the internet, built on decentralized protocols powered by blockchain technology.

## Blockchain Basics
A blockchain is a distributed ledger — a chain of blocks each containing data, cryptographically linked together. No single party controls it.

## Smart Contracts
Smart contracts are self-executing programs stored on the blockchain. They run automatically when predefined conditions are met, removing the need for intermediaries.

## Decentralized Applications (dApps)
dApps are applications built on top of blockchain networks. Popular examples include Uniswap (DeFi), OpenSea (NFTs), and Aave (lending).

## Getting Started
- Learn Solidity (the main smart contract language)
- Explore Ethereum testnets
- Try building a simple token contract

## Conclusion
Web3 is still early-stage, but understanding the foundations now puts you ahead of the curve.`,
    links: "https://ethereum.org, https://solidity-by-example.org",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
  },
];

const categories = ["All", "Tech", "Events", "Life", "Design"];
const statuses = ["All", "Pending", "Approved", "Rejected"];

const statusStyle = {
  pending:  { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b",  label: "Pending"  },
  approved: { bg: "rgba(16,185,129,0.12)",  color: "#10b981",  label: "Approved" },
  rejected: { bg: "rgba(239,68,68,0.12)",   color: "#ef4444",  label: "Rejected" },
};

// Renders simple markdown-ish content into styled JSX
function BlogContent({ content }) {
  if (!content) return null;
  return (
    <div style={{ color: "#aaa", fontSize: "14px", lineHeight: 1.9 }}>
      {content.split("\n").map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} style={{ color: "#fff", fontSize: "16px", fontWeight: 700, margin: "20px 0 8px", fontFamily: "'Space Grotesk', sans-serif" }}>
              {line.replace("## ", "")}
            </h2>
          );
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <p key={i} style={{ color: "#ccc", fontWeight: 600, margin: "8px 0 4px" }}>
              {line.replace(/\*\*/g, "")}
            </p>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <div key={i} style={{ display: "flex", gap: "8px", margin: "3px 0", paddingLeft: "8px" }}>
              <span style={{ color: "#6366f1", flexShrink: 0 }}>•</span>
              <span>{line.replace("- ", "")}</span>
            </div>
          );
        }
        if (line.startsWith("```") || line === "") {
          return <div key={i} style={{ height: line === "" ? "4px" : "0" }} />;
        }
        if (line.startsWith("`") && line.endsWith("`")) {
          return (
            <code key={i} style={{
              display: "block", background: "#1a1a1a", border: "1px solid #2a2a2a",
              borderRadius: "8px", padding: "10px 14px", fontFamily: "monospace",
              fontSize: "12px", color: "#a5b4fc", margin: "8px 0",
            }}>
              {line.replace(/`/g, "")}
            </code>
          );
        }
        return <p key={i} style={{ margin: "4px 0" }}>{line}</p>;
      })}
    </div>
  );
}

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);

  const updateStatus = (id, newStatus) => {
    setBlogs(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    if (preview?.id === id) setPreview(p => ({ ...p, status: newStatus }));
  };

  const filtered = blogs.filter(b => {
    const matchStatus   = filterStatus   === "All" || b.status   === filterStatus.toLowerCase();
    const matchCat      = filterCategory === "All" || b.category === filterCategory;
    const matchSearch   = b.title.toLowerCase().includes(search.toLowerCase()) ||
                          b.author.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchCat && matchSearch;
  });

  return (
    <div style={{ padding: "32px", minHeight: "100vh", background: "#0d0d0d", fontFamily: "'Space Grotesk', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#fff", margin: 0 }}>Blog Management</h1>
        <p style={{ color: "#555", fontSize: "13px", marginTop: "4px" }}>Review and approve blog submissions from society members</p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        {[
          { label: "Total",    value: blogs.length,                                    color: "#a855f7" },
          { label: "Pending",  value: blogs.filter(b => b.status === "pending").length, color: "#f59e0b" },
          { label: "Approved", value: blogs.filter(b => b.status === "approved").length,color: "#10b981" },
          { label: "Rejected", value: blogs.filter(b => b.status === "rejected").length,color: "#ef4444" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "10px", background: "#111", border: "1px solid #1f1f1f" }}>
            <span style={{ fontSize: "20px", fontWeight: 700, color: s.color }}>{s.value}</span>
            <span style={{ color: "#666", fontSize: "13px" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "24px" }}>
        <input
          type="text"
          placeholder="Search blogs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: "1", minWidth: "180px", padding: "8px 14px", borderRadius: "10px",
            background: "#111", border: "1px solid #1f1f1f", color: "#fff",
            fontSize: "13px", outline: "none", fontFamily: "'Space Grotesk', sans-serif",
          }}
        />
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
              cursor: "pointer", transition: "all 0.2s", fontFamily: "'Space Grotesk', sans-serif",
              background: filterStatus === s ? "rgba(168,85,247,0.15)" : "#111",
              color:      filterStatus === s ? "#a855f7" : "#666",
              border:     `1px solid ${filterStatus === s ? "rgba(168,85,247,0.3)" : "#1f1f1f"}`,
            }}>{s}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {categories.map(c => (
            <button key={c} onClick={() => setFilterCategory(c)} style={{
              padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
              cursor: "pointer", transition: "all 0.2s", fontFamily: "'Space Grotesk', sans-serif",
              background: filterCategory === c ? "rgba(99,102,241,0.15)" : "#111",
              color:      filterCategory === c ? "#6366f1" : "#666",
              border:     `1px solid ${filterCategory === c ? "rgba(99,102,241,0.3)" : "#1f1f1f"}`,
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Blog Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {filtered.map(blog => {
          const st = statusStyle[blog.status];
          return (
            <div
              key={blog.id}
              onClick={() => setPreview(blog)}
              style={{
                background: "#111", borderRadius: "14px", border: "1px solid #1f1f1f",
                overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1f1f1f"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ position: "relative" }}>
                <img src={blog.image} alt={blog.title} style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }} />
                {/* Member badge on image */}
                {blog.isMember === "yes" && (
                  <span style={{
                    position: "absolute", top: "8px", right: "8px",
                    padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 600,
                    background: "rgba(99,102,241,0.85)", color: "#fff", backdropFilter: "blur(4px)",
                  }}>
                    🏛 Member
                  </span>
                )}
              </div>
              <div style={{ padding: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "999px", background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>
                    {blog.category}
                  </span>
                  <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "999px", fontWeight: 600, background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                </div>
                <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: 600, margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {blog.title}
                </h3>
                <p style={{ color: "#555", fontSize: "12px", margin: "0 0 6px" }}>by {blog.author} · {blog.date}</p>
                <p style={{ color: "#666", fontSize: "12px", margin: "0 0 14px", lineHeight: 1.6,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {blog.description}
                </p>
                {/* Quick action buttons */}
                <div style={{ display: "flex", gap: "6px" }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setPreview(blog)}
                    style={{ flex: 1, padding: "7px 0", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", background: "#1a1a1a", color: "#888", border: "1px solid #2a2a2a" }}
                  >
                    Read
                  </button>
                  {blog.status !== "approved" && (
                    <button
                      onClick={() => updateStatus(blog.id, "approved")}
                      style={{ flex: 1, padding: "7px 0", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", background: "rgba(16,185,129,0.12)", color: "#10b981", border: "none" }}
                    >
                      Approve
                    </button>
                  )}
                  {blog.status !== "rejected" && (
                    <button
                      onClick={() => updateStatus(blog.id, "rejected")}
                      style={{ flex: 1, padding: "7px 0", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "none" }}
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", paddingTop: "80px" }}>
          <p style={{ fontSize: "48px", marginBottom: "12px" }}>📝</p>
          <p style={{ color: "#444", fontSize: "14px" }}>No blogs match your filters</p>
        </div>
      )}

      {/* ── Full Preview Modal ── */}
      {preview && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
          }}
          onClick={() => setPreview(null)}
        >
          <div
            style={{
              width: "100%", maxWidth: "680px", maxHeight: "90vh",
              borderRadius: "20px", overflow: "hidden",
              background: "#111", border: "1px solid #2a2a2a",
              display: "flex", flexDirection: "column",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal image */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img src={preview.image} alt={preview.title} style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }} />
              {/* Close button */}
              <button
                onClick={() => setPreview(null)}
                style={{
                  position: "absolute", top: "12px", right: "12px",
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff", fontSize: "16px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(4px)",
                }}
              >
                ×
              </button>
              {/* Status badge on image */}
              <span style={{
                position: "absolute", bottom: "12px", left: "14px",
                padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 600,
                background: statusStyle[preview.status].bg, color: statusStyle[preview.status].color,
                backdropFilter: "blur(4px)", border: `1px solid ${statusStyle[preview.status].color}33`,
              }}>
                {statusStyle[preview.status].label}
              </span>
            </div>

            {/* Scrollable content */}
            <div style={{ overflowY: "auto", flex: 1, padding: "24px 28px" }}>
              {/* Tags row */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "999px", background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>
                  {preview.category}
                </span>
                {preview.isMember === "yes" && (
                  <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "999px", background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>
                    🏛 Organization Member
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, margin: "0 0 6px", lineHeight: 1.3 }}>
                {preview.title}
              </h2>
              <p style={{ color: "#555", fontSize: "13px", margin: "0 0 16px" }}>by {preview.author} · {preview.date}</p>

              {/* Member info card */}
              {preview.isMember === "yes" && preview.rollNumber && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px", borderRadius: "12px", marginBottom: "20px",
                  background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)",
                }}>
                  <span style={{ fontSize: "20px" }}>🎓</span>
                  <div>
                    <p style={{ color: "#818cf8", fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>
                      Organization Member
                    </p>
                    <p style={{ color: "#aaa", fontSize: "13px", margin: "2px 0 0" }}>
                      Roll No: <strong style={{ color: "#fff" }}>{preview.rollNumber}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Short description */}
              <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.7, margin: "0 0 24px", fontStyle: "italic", borderLeft: "3px solid #2a2a2a", paddingLeft: "14px" }}>
                {preview.description}
              </p>

              {/* Divider */}
              <div style={{ height: "1px", background: "#1f1f1f", margin: "0 0 24px" }} />

              {/* Full content */}
              <BlogContent content={preview.content} />

              {/* Related links */}
              {preview.links && (
                <div style={{ marginTop: "24px", padding: "14px 16px", borderRadius: "12px", background: "#161616", border: "1px solid #222" }}>
                  <p style={{ color: "#555", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>
                    Related Links
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {preview.links.split(",").map((link, i) => (
                      <a
                        key={i}
                        href={link.trim()}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: "12px", color: "#6366f1",
                          textDecoration: "none", padding: "3px 10px",
                          borderRadius: "6px", background: "rgba(99,102,241,0.08)",
                          border: "1px solid rgba(99,102,241,0.2)",
                        }}
                      >
                        🔗 {link.trim()}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky action bar */}
            <div style={{
              padding: "16px 24px", borderTop: "1px solid #1f1f1f",
              display: "flex", gap: "10px", flexShrink: 0,
              background: "#0f0f0f",
            }}>
              {preview.status !== "approved" && (
                <button
                  onClick={() => updateStatus(preview.id, "approved")}
                  style={{
                    flex: 1, padding: "11px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
                    cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", border: "none",
                    background: "rgba(16,185,129,0.15)", color: "#10b981", transition: "background 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(16,185,129,0.25)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(16,185,129,0.15)"}
                >
                  ✓ Approve Blog
                </button>
              )}
              {preview.status === "approved" && (
                <div style={{ flex: 1, padding: "11px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
                  background: "rgba(16,185,129,0.08)", color: "#10b981", textAlign: "center", border: "1px solid rgba(16,185,129,0.2)" }}>
                  ✓ Already Approved
                </div>
              )}
              {preview.status !== "rejected" && (
                <button
                  onClick={() => updateStatus(preview.id, "rejected")}
                  style={{
                    flex: 1, padding: "11px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
                    cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", border: "none",
                    background: "rgba(239,68,68,0.15)", color: "#ef4444", transition: "background 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.25)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
                >
                  ✗ Reject Blog
                </button>
              )}
              {preview.status === "rejected" && (
                <div style={{ flex: 1, padding: "11px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
                  background: "rgba(239,68,68,0.08)", color: "#ef4444", textAlign: "center", border: "1px solid rgba(239,68,68,0.2)" }}>
                  ✗ Already Rejected
                </div>
              )}
              <button
                onClick={() => setPreview(null)}
                style={{
                  padding: "11px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 500,
                  cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
                  background: "#1a1a1a", color: "#666", border: "1px solid #2a2a2a",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
