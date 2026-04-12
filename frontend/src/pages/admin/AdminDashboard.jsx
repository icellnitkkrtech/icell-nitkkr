import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  Users,
  UserCheck,
  UserX,
  Briefcase,
  BookOpen,
  Calendar,
  Image,
  Mail,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    // Don't fetch if still waiting for auth
    if (authLoading) {
      return;
    }

    // Fetch dashboard stats from backend
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/stats");
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [authLoading, user, navigate]);

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div
      className="p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border"
      style={{
        background: bgColor,
        borderColor: color,
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
        <div>
          <p className="text-[#888] text-xs sm:text-sm font-medium mb-1 sm:mb-2">
            {title}
          </p>
          <h3
            className="text-xl sm:text-2xl md:text-3xl font-bold"
            style={{ color: color }}
          >
            {value || 0}
          </h3>
        </div>
        <Icon
          size={24}
          className="hidden sm:block"
          style={{ color }}
          strokeWidth={1.5}
        />
        <Icon
          size={20}
          className="block sm:hidden"
          style={{ color }}
          strokeWidth={1.5}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0d0d0d] text-white">
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <p className="text-lg text-[#666]">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 overflow-auto">
        <div
          className="p-4 sm:p-6 md:p-8 min-h-screen max-md:pt-20"
          style={{ background: "#0d0d0d" }}
        >
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Dashboard
            </h1>
            <p className="text-[#555] text-xs sm:text-sm">
              Welcome back, {user?.email || "Admin"}! Here's what's happening.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg border border-red-500 bg-red-500/10 text-red-400">
              <p>Error loading stats: {error}</p>
            </div>
          )}

          {/* User Statistics Section */}
          <div className="mb-8 sm:mb-10">
            <h2
              className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-5"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              User Statistics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 mb-8">
              <StatCard
                icon={Users}
                title="Total Users"
                value={stats?.totalUsers}
                color="#06b6d4"
                bgColor="rgba(6, 182, 212, 0.08)"
              />
              <StatCard
                icon={Users}
                title="Total Students"
                value={stats?.totalStudents}
                color="#10b981"
                bgColor="rgba(16, 185, 129, 0.08)"
              />
              <StatCard
                icon={UserCheck}
                title="Total Members"
                value={stats?.totalMembers}
                color="#3b82f6"
                bgColor="rgba(59, 130, 246, 0.08)"
              />
              <StatCard
                icon={Briefcase}
                title="Post Holders"
                value={stats?.totalPostHolders}
                color="#f59e0b"
                bgColor="rgba(245, 158, 11, 0.08)"
              />
              <StatCard
                icon={UserX}
                title="Unverified Users"
                value={stats?.unverifiedUsers}
                color="#ef4444"
                bgColor="rgba(239, 68, 68, 0.08)"
              />
            </div>
          </div>

          {/* Content Statistics Section */}
          <div>
            <h2
              className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-5"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Content Statistics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              <StatCard
                icon={Calendar}
                title="Total Events"
                value={stats?.totalEvents}
                color="#f59e0b"
                bgColor="rgba(245, 158, 11, 0.08)"
              />
              <StatCard
                icon={BookOpen}
                title="Total Blogs"
                value={stats?.totalBlogs}
                color="#6366f1"
                bgColor="rgba(99, 102, 241, 0.08)"
              />
              <StatCard
                icon={Image}
                title="Gallery Photos"
                value={stats?.totalPhotos}
                color="#ec4899"
                bgColor="rgba(236, 72, 153, 0.08)"
              />
              <StatCard
                icon={Mail}
                title="Total Newsletters"
                value={stats?.totalNewsletters}
                color="#a855f7"
                bgColor="rgba(168, 85, 247, 0.08)"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-10 sm:mt-12">
            <h2
              className="text-lg sm:text-xl font-bold text-white mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <button
                onClick={() => navigate("/admin/students")}
                className="p-4 sm:p-6 rounded-lg border transition-all hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20"
                style={{ borderColor: "#1f1f1f", background: "#0d0d0d" }}
              >
                <Users size={24} className="mb-2 text-green-500" />
                <h3 className="text-sm font-semibold text-white">
                  Manage Students
                </h3>
                <p className="text-xs text-[#666] mt-1">
                  View and edit student data
                </p>
              </button>

              <button
                onClick={() => navigate("/admin/events")}
                className="p-4 sm:p-6 rounded-lg border transition-all hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20"
                style={{ borderColor: "#1f1f1f", background: "#0d0d0d" }}
              >
                <Calendar size={24} className="mb-2 text-yellow-500" />
                <h3 className="text-sm font-semibold text-white">
                  Manage Events
                </h3>
                <p className="text-xs text-[#666] mt-1">
                  Create and update events
                </p>
              </button>

              <button
                onClick={() => navigate("/admin/blogs")}
                className="p-4 sm:p-6 rounded-lg border transition-all hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20"
                style={{ borderColor: "#1f1f1f", background: "#0d0d0d" }}
              >
                <BookOpen size={24} className="mb-2 text-blue-500" />
                <h3 className="text-sm font-semibold text-white">
                  Manage Blogs
                </h3>
                <p className="text-xs text-[#666] mt-1">
                  Approve and manage blogs
                </p>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-12">
            <h2
              className="text-xl font-bold text-white mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              System Info
            </h2>
            <div
              className="p-6 rounded-lg border"
              style={{ background: "#111111", borderColor: "#1f1f1f" }}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#888]">Admin Email:</span>
                  <span className="text-white">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#888]">User ID:</span>
                  <span className="text-white text-sm font-mono">
                    {user?._id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#888]">Last Updated:</span>
                  <span className="text-white">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
