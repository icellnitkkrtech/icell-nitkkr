

import { useNavigate, useLocation } from "react-router-dom";

const navLinks = [
  {
    label: "Dashboard",
    path: "/admin",
    key: "dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Blogs",
    path: "/admin/blogs",
    key: "blogs",
    badge: 3,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: "Newsletters",
    path: "/admin/newsletters",
    key: "newsletters",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    label: "Teams",
    path: "/admin/teams",
    key: "teams",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Events",
    path: "/admin/events",
    key: "events",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Gallery",
    path: "/admin/gallery",
    key: "gallery",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if a nav link is active
  // Dashboard is only active on exact /admin
  // Others are active if pathname starts with their path
  const isActive = (link) => {
    if (link.key === "dashboard") {
      return location.pathname === "/admin" || location.pathname === "/admin/";
    }
    return location.pathname.startsWith(link.path);
  };

  return (
    <aside
      className="fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300"
      style={{
        width: sidebarOpen ? "256px" : "64px",
        background: "linear-gradient(180deg, #111111 0%, #0d0d0d 100%)",
        borderRight: "1px solid #1f1f1f",
      }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1f1f1f]">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)" }}
        >
          <span className="text-white font-bold text-sm">A</span>
        </div>

        {sidebarOpen && (
          <div className="overflow-hidden">
            <p
              className="text-white font-semibold text-sm leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Society Admin
            </p>
            <p className="text-[#555] text-xs">Control Panel</p>
          </div>
        )}

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="ml-auto text-[#555] hover:text-white transition-colors flex-shrink-0"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            {sidebarOpen ? (
              <>
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </>
            ) : (
              <>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* ── Nav Links ── */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navLinks.map((link) => {
          const active = isActive(link);
          return (
            <button
              key={link.key}
              onClick={() => navigate(link.path)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative"
              style={{
                background: active ? "rgba(168,85,247,0.12)" : "transparent",
                color: active ? "#a855f7" : "#888",
              }}
            >
              {/* Active left bar */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: "#a855f7" }}
                />
              )}

              <span className="flex-shrink-0">{link.icon}</span>

              {sidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {link.label}
                </span>
              )}

              {/* Badge (only shown when sidebar is open) */}
              {sidebarOpen && link.badge && (
                <span
                  className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(168,85,247,0.2)",
                    color: "#a855f7",
                  }}
                >
                  {link.badge}
                </span>
              )}

              {/* Tooltip when sidebar is collapsed */}
              {!sidebarOpen && (
                <div className="absolute left-14 bg-[#1a1a1a] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-[#2a2a2a] z-50 transition-opacity">
                  {link.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Bottom user info ── */}
      <div className="p-3 border-t border-[#1f1f1f]">
        <div className="flex items-center gap-3 px-2">
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)" }}
          >
            AD
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-white text-xs font-medium">Admin</p>
              <p className="text-[#555] text-xs">admin@society.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
