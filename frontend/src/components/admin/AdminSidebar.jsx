import { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(sidebarOpen ?? true);
  const { logout } = useAuth();

  const handleLogout = async () => {
    logout();
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    setSidebarOpen?.(!isOpen);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-6 left-6 z-50 hidden max-md:block p-2 rounded-lg hover:bg-[#1f1f1f] transition-colors"
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Menu size={24} className="text-white" />
        )}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 hidden max-md:block"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#111111] border-r z-40 transition-all duration-300 overflow-hidden flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:static md:translate-x-0`}
        style={{ borderColor: "#1f1f1f" }}
      >
        {/* Header */}
        <div
          className="pt-16 md:pt-0 p-6 border-b flex items-center justify-between"
          style={{ borderColor: "#1f1f1f" }}
        >
          <div>
            <h2 className="text-xl font-bold text-white">ICell Admin</h2>
            <p className="text-[#555] text-xs mt-1">Management System</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-yellow-400/20 transition-all duration-200 group"
            title="Go to Home"
          >
            <Home
              size={20}
              className="text-yellow-400 group-hover:text-yellow-300 group-hover:scale-110 transition-transform"
            />
          </button>
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
                  navigate(link.path);
                  setIsOpen(false);
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
