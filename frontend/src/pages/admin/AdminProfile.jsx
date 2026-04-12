import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  User,
  Mail,
  LogOut,
  Award,
  Users,
  Calendar,
  BookOpen,
  Shield,
  BarChart3,
} from "lucide-react";

export default function AdminProfile() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (
      !authLoading &&
      (!user || (user.role !== "admin" && user.role !== "post_holder"))
    ) {
      navigate("/");
      return;
    }

    // Don't fetch if still waiting for auth
    if (authLoading) {
      return;
    }

    const fetchAdminData = async () => {
      try {
        // Fetch admin profile
        const profileResponse = await api.get("/auth/profile");
        setProfile(profileResponse.data);

        // Fetch admin statistics
        try {
          const [blogsRes, eventsRes, studentsRes] = await Promise.all([
            api.get("/blogs/admin/all").catch(() => ({ data: [] })),
            api.get("/events").catch(() => ({ data: [] })),
            api.get("/students").catch(() => ({ data: [] })),
          ]);

          setAdminStats({
            blogs: blogsRes.data?.length || 0,
            events: eventsRes.data?.length || 0,
            students: studentsRes.data?.length || 0,
            newsletters: 0,
          });
        } catch (err) {
          console.warn("Could not fetch admin stats:", err);
          setAdminStats({
            blogs: 0,
            events: 0,
            students: 0,
            newsletters: 0,
          });
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError("Failed to load admin profile");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [authLoading, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div
      className="flex h-screen bg-[#0d0d0d] text-white"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-md:pt-20">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Profile</h1>
            <p className="text-[#555]">
              Your admin account & management overview
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-[#555]">Loading admin profile...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-400">{error}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Profile Info */}
              <div className="lg:col-span-1 space-y-6">
                {/* Profile Card */}
                <div
                  className="rounded-xl border p-6"
                  style={{ background: "#111111", borderColor: "#1f1f1f" }}
                >
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center mb-4">
                      <Shield size={40} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold mb-1">
                      {profile?.name || "Admin"}
                    </h2>
                    <p className="text-[#555] text-sm">Administrator</p>
                  </div>

                  <div
                    className="space-y-3 text-sm border-t"
                    style={{ borderColor: "#1f1f1f" }}
                  >
                    <div className="flex items-center gap-3 mt-4">
                      <Mail size={16} className="text-purple-400" />
                      <span className="text-[#999] truncate">
                        {profile?.email}
                      </span>
                    </div>

                    {profile?.phone && (
                      <div className="flex items-center gap-3">
                        <User size={16} className="text-blue-400" />
                        <span className="text-[#999]">{profile.phone}</span>
                      </div>
                    )}

                    {profile?.post_position && (
                      <div className="flex items-center gap-3">
                        <BarChart3 size={16} className="text-green-400" />
                        <span className="text-[#999]">
                          {profile.post_position}
                        </span>
                      </div>
                    )}
                  </div>

                  <div
                    className="mt-4 pt-4 border-t"
                    style={{ borderColor: "#1f1f1f" }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs text-[#999]">Active Admin</span>
                    </div>
                    <p className="text-xs text-[#555] mt-2">
                      Joined{" "}
                      {new Date(profile?.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div
                  className="rounded-xl border p-6"
                  style={{ background: "#111111", borderColor: "#1f1f1f" }}
                >
                  <h3 className="font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate("/admin/students")}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#1f1f1f] transition-colors text-sm"
                    >
                      → Manage Students
                    </button>
                    <button
                      onClick={() => navigate("/admin/events")}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#1f1f1f] transition-colors text-sm"
                    >
                      → Manage Events
                    </button>
                    <button
                      onClick={() => navigate("/admin/attendance")}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#1f1f1f] transition-colors text-sm"
                    >
                      → View Attendance
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Details & Stats */}
              <div className="lg:col-span-2 space-y-6">
                {/* Admin Information */}
                <div
                  className="rounded-xl border p-6"
                  style={{ background: "#111111", borderColor: "#1f1f1f" }}
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: "#a855f718" }}
                    >
                      <Shield size={18} style={{ color: "#a855f7" }} />
                    </div>
                    Admin Information
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <p className="text-[#555] text-sm mb-1">Full Name</p>
                      <p className="text-white">{profile?.name || "N/A"}</p>
                    </div>

                    <div
                      className="border-t"
                      style={{ borderColor: "#1f1f1f" }}
                    >
                      <p className="text-[#555] text-sm mb-1 mt-3">
                        Email Address
                      </p>
                      <p className="text-white break-all">
                        {profile?.email || "N/A"}
                      </p>
                    </div>

                    <div
                      className="border-t"
                      style={{ borderColor: "#1f1f1f" }}
                    >
                      <p className="text-[#555] text-sm mb-1 mt-3">Role</p>
                      <p className="text-white capitalize">
                        {profile?.role === "post_holder"
                          ? "Post Holder"
                          : "Administrator"}
                      </p>
                      {profile?.post_position && (
                        <p className="text-[#999] text-xs mt-1">
                          Position: {profile.post_position}
                        </p>
                      )}
                    </div>

                    <div
                      className="border-t"
                      style={{ borderColor: "#1f1f1f" }}
                    >
                      <p className="text-[#555] text-sm mb-1 mt-3">
                        Permission Level
                      </p>
                      <p
                        className="text-sm px-2.5 py-1 rounded-md inline-block"
                        style={{ background: "#a855f715", color: "#a855f7" }}
                      >
                        Full Access
                      </p>
                    </div>
                  </div>
                </div>

                {/* Management Stats */}
                <div
                  className="rounded-xl border p-6"
                  style={{ background: "#111111", borderColor: "#1f1f1f" }}
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: "#0ea5e918" }}
                    >
                      <BarChart3 size={18} style={{ color: "#0ea5e9" }} />
                    </div>
                    Management Overview
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className="rounded-lg p-4"
                      style={{ background: "#0d0d0d" }}
                    >
                      <p className="text-[#555] text-sm mb-2">Total Events</p>
                      <p className="text-2xl font-bold text-cyan-400">
                        {adminStats?.events || 0}
                      </p>
                    </div>
                    <div
                      className="rounded-lg p-4"
                      style={{ background: "#0d0d0d" }}
                    >
                      <p className="text-[#555] text-sm mb-2">
                        Active Students
                      </p>
                      <p className="text-2xl font-bold text-green-400">
                        {adminStats?.students || 0}
                      </p>
                    </div>
                    <div
                      className="rounded-lg p-4"
                      style={{ background: "#0d0d0d" }}
                    >
                      <p className="text-[#555] text-sm mb-2">
                        Published Blogs
                      </p>
                      <p className="text-2xl font-bold text-purple-400">
                        {adminStats?.blogs || 0}
                      </p>
                    </div>
                    <div
                      className="rounded-lg p-4"
                      style={{ background: "#0d0d0d" }}
                    >
                      <p className="text-[#555] text-sm mb-2">Newsletters</p>
                      <p className="text-2xl font-bold text-orange-400">
                        {adminStats?.newsletters || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 font-medium border"
                  style={{
                    background: "#ef444415",
                    borderColor: "#ef444430",
                    color: "#ef4444",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#ef444425";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#ef444415";
                  }}
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
