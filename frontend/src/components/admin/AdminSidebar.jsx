import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  Mail,
  Image,
  Clock,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Award,
  FileCog,
  Home,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const adminLinks = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
    color: "#a855f7",
  },
  {
    label: "Profile",
    icon: User,
    path: "/admin/profile",
    color: "#0ea5e9",
  },
  {
    label: "Students",
    icon: Users,
    path: "/admin/students",
    color: "#10b981",
  },
  {
    label: "Events",
    icon: Calendar,
    path: "/admin/events",
    color: "#6366f1",
  },
  {
    label: "Attendance",
    icon: Clock,
    path: "/admin/attendance",
    color: "#0ea5e9",
  },
  {
    label: "Certificates",
    icon: Award,
    path: "/admin/certificates",
    color: "#f59e0b",
  },
  {
    label: "Certificate Templates",
    icon: FileCog,
    path: "/admin/certificate-templates",
    color: "#f97316",
  },
  {
    label: "Blogs",
    icon: BookOpen,
    path: "/admin/blogs",
    color: "#a855f7",
  },
  {
    label: "Newsletters",
    icon: Mail,
    path: "/admin/newsletters",
    color: "#ef4444",
  },
  {
    label: "Gallery",
    icon: Image,
    path: "/admin/gallery",
    color: "#06b6d4",
  },
];

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Helper to determine if we are in overlay/drawer mode (screen width < 1024px)
  const isDrawerMode = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false;
  };

  // On any screen where hamburger is active (< 1024px), sidebar must default to closed (false)
  const [isOpen, setIsOpen] = useState(() => {
    if (isDrawerMode()) return false;
    return sidebarOpen ?? true;
  });

  const closeSidebar = () => {
    setIsOpen(false);
    setSidebarOpen?.(false);
  };

  const toggleSidebar = () => {
    const next = !isOpen;
    setIsOpen(next);
    setSidebarOpen?.(next);
  };

  // Close sidebar whenever route/section changes on screens with drawer
  useEffect(() => {
    if (isDrawerMode()) {
      closeSidebar();
    }
  }, [location.pathname]);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      if (isDrawerMode()) {
        closeSidebar();
      } else {
        setIsOpen(true);
        setSidebarOpen?.(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    if (isDrawerMode()) {
      closeSidebar();
    }
    logout();
    navigate("/");
  };

  const isActive = (path) => {
    if (location.pathname === path) return true;
    return location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      {/* Menu Button for screens where sidebar is a drawer */}
      <button
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center p-2.5 rounded-xl bg-[#18181b]/90 backdrop-blur-md border border-white/15 text-white shadow-xl hover:bg-[#27272a] transition-all"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop for drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden block"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#111111] border-r z-40 transition-all duration-300 overflow-hidden flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:translate-x-0`}
        style={{ borderColor: "#1f1f1f" }}
      >
        {/* Header */}
        <div
          className="pt-16 lg:pt-0 p-6 border-b flex items-center justify-between"
          style={{ borderColor: "#1f1f1f" }}
        >
          <div>
            <h2 className="text-xl font-bold text-white">ICell Admin</h2>
            <p className="text-[#555] text-xs mt-1">Management System</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (isDrawerMode()) closeSidebar();
                navigate("/");
              }}
              className="p-2 rounded-lg hover:bg-yellow-400/20 transition-all duration-200 group"
              title="Go to Home"
            >
              <Home
                size={18}
                className="text-yellow-400 group-hover:text-yellow-300 group-hover:scale-110 transition-transform"
              />
            </button>
            <button
              onClick={closeSidebar}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden flex text-neutral-400 hover:text-white"
              title="Close Sidebar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <button
                key={link.label}
                onClick={() => {
                  if (isDrawerMode()) {
                    closeSidebar();
                  }
                  navigate(link.path);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left group"
                style={{
                  background: active ? `${link.color}20` : "transparent",
                  borderLeft: active
                    ? `3px solid ${link.color}`
                    : "3px solid transparent",
                  paddingLeft: active ? "13px" : "16px",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = `${link.color}10`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <Icon
                  size={18}
                  style={{
                    color: active ? link.color : "#999",
                  }}
                />
                <span
                  className="text-sm font-medium flex-1"
                  style={{
                    color: active ? link.color : "#ccc",
                  }}
                >
                  {link.label}
                </span>
                {active && (
                  <ChevronRight size={16} style={{ color: link.color }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t" style={{ borderColor: "#1f1f1f" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200"
            style={{
              background: "#ef444415",
              color: "#ef4444",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ef444425";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ef444415";
            }}
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
