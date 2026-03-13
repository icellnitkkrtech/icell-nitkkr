



import { useState } from "react";

const stats = [
  { label: "Total Blogs", value: "24", sub: "3 pending approval", color: "#a855f7", icon: "📝" },
  { label: "Newsletters", value: "12", sub: "Last uploaded 2d ago", color: "#6366f1", icon: "📧" },
  { label: "Team Members", value: "38", sub: "Across 5 teams", color: "#0ea5e9", icon: "👥" },
  { label: "Events", value: "7", sub: "2 upcoming", color: "#10b981", icon: "📅" },
  { label: "Gallery Photos", value: "156", sub: "From 8 events", color: "#f59e0b", icon: "🖼️" },
  { label: "Certificates Sent", value: "94", sub: "Last event: 28", color: "#ef4444", icon: "🎓" },
];

const recentBlogs = [
  { title: "Introduction to Machine Learning", author: "Rahul Sharma", category: "Tech", status: "pending", time: "2h ago" },
  { title: "Hackathon 2025 Recap", author: "Priya Mehta", category: "Events", status: "approved", time: "5h ago" },
  { title: "Open Source Contribution Guide", author: "Aman Verma", category: "Tech", status: "pending", time: "1d ago" },
  { title: "Campus Life as a Developer", author: "Sneha Roy", category: "Life", status: "approved", time: "2d ago" },
];

const upcomingEvents = [
  { name: "WebDev Workshop", date: "Mar 15", participants: 42 },
  { name: "AI Hackathon 2025", date: "Mar 28", participants: 87 },
  { name: "Open Source Sprint", date: "Apr 5", participants: 23 },
];

export default function AdminDashboard() {
  return (
    <div className="p-8 min-h-screen" style={{ background: "#0d0d0d" }}>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[#555] text-sm mb-1">Welcome back,</p>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Admin Dashboard
        </h1>
        <p className="text-[#444] text-sm mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="rounded-xl p-5 border transition-all duration-200 hover:border-opacity-60 cursor-default"
            style={{ background: "#111111", borderColor: "#1f1f1f" }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: `${stat.color}18`, color: stat.color }}
              >
                live
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-white text-sm font-medium">{stat.label}</p>
            <p className="text-[#555] text-xs mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Blogs */}
        <div
          className="lg:col-span-3 rounded-xl border p-6"
          style={{ background: "#111111", borderColor: "#1f1f1f" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Recent Blog Submissions
            </h2>
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}
            >
              3 pending
            </span>
          </div>
          <div className="space-y-3">
            {recentBlogs.map((blog, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#161616] transition-colors"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: blog.status === "pending" ? "#f59e0b" : "#10b981" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{blog.title}</p>
                  <p className="text-[#555] text-xs">{blog.author} · {blog.category}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[#444] text-xs">{blog.time}</span>
                  {blog.status === "pending" && (
                    <div className="flex gap-1">
                      <button
                        className="text-xs px-2 py-1 rounded-md font-medium transition-colors"
                        style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}
                      >
                        ✓
                      </button>
                      <button
                        className="text-xs px-2 py-1 rounded-md font-medium transition-colors"
                        style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
                      >
                        ✗
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div
          className="lg:col-span-2 rounded-xl border p-6"
          style={{ background: "#111111", borderColor: "#1f1f1f" }}
        >
          <h2 className="text-white font-semibold mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Upcoming Events
          </h2>
          <div className="space-y-4">
            {upcomingEvents.map((ev, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}
                >
                  {ev.date.split(" ")[1]}
                  <br />
                  <span style={{ fontSize: "9px" }}>{ev.date.split(" ")[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{ev.name}</p>
                  <p className="text-[#555] text-xs">{ev.participants} participants</p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-6 p-4 rounded-xl"
            style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.1))", border: "1px solid rgba(168,85,247,0.2)" }}
          >
            <p className="text-white text-sm font-semibold mb-1">Quick Actions</p>
            <div className="space-y-2 mt-3">
              {["Approve pending blogs", "Upload newsletter", "Add event"].map((action, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#888] cursor-pointer hover:text-white transition-colors">
                  <span style={{ color: "#a855f7" }}>→</span> {action}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
