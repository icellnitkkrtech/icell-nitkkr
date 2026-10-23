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
  const [certificates, setCertificates] = useState([]);
  const [certLoading, setCertLoading] = useState(false);
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
        const profileData = profileResponse.data;
        setProfile(profileData);

        // If post holder, fetch their personal certificates
        if (profileData?.role === "post_holder" || user?.role === "post_holder") {
          try {
            const certRes = await api.get("/certificate/user/all");
            if (certRes.data && certRes.data.certificates) {
              setCertificates(certRes.data.certificates);
            } else {
              setCertificates([]);
            }
          } catch (cErr) {
            console.warn("Could not fetch certificates for post holder:", cErr);
            setCertificates([]);
          }
        }

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

  const downloadCertificate = async (cert) => {
    setCertLoading(true);
    try {
      const endpoint = `/certificate/download/${cert._id}`;
      const safeTitle = (cert.title || "certificate").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
      const filename = `${safeTitle}-${cert._id}.png`;

      const response = await api.get(endpoint, {
        responseType: "arraybuffer",
      });

      const blob = new Blob([response.data], { type: "image/png" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download certificate: " + (err.response?.data?.error || err.message));
    } finally {
      setCertLoading(false);
    }
  };

  const previewCertificate = async (cert) => {
    try {
      const endpoint = `/certificate/download/${cert._id}?preview=true`;
      const response = await api.get(endpoint, {
        responseType: "blob",
      });
      const blobUrl = URL.createObjectURL(response.data);
      const previewWindow = window.open(blobUrl, "_blank");
      if (!previewWindow) {
        alert("Please allow popups to preview your certificate.");
      }
    } catch (err) {
      console.error("Preview error:", err);
      alert("Failed to preview certificate: " + (err.response?.data?.error || err.message));
    }
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
            <h1 className="text-3xl font-bold mb-2">
              {profile?.role === "post_holder" ? "Post Holder Profile" : "Admin Profile"}
            </h1>
            <p className="text-[#555]">
              {profile?.role === "post_holder"
                ? "Your post holder account, certificates & management overview"
                : "Your admin account & management overview"}
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
                      {profile?.name || (profile?.role === "post_holder" ? "Post Holder" : "Admin")}
                    </h2>
                    <p className="text-[#555] text-sm">
                      {profile?.role === "post_holder" ? "Post Holder" : "Administrator"}
                    </p>
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
                      <span className="text-xs text-[#999]">
                        {profile?.role === "post_holder" ? "Active Post Holder" : "Active Admin"}
                      </span>
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

                {/* Certificates Section for Post Holder only */}
                {(profile?.role === "post_holder" || user?.role === "post_holder") && (
                  <div
                    className="rounded-xl border p-6 w-full"
                    style={{ background: "#111111", borderColor: "#1f1f1f" }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ background: "#f59e0b18" }}
                        >
                          <Award size={18} style={{ color: "#f59e0b" }} />
                        </div>
                        My Certificates
                      </h3>
                      {certificates && certificates.length > 0 && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-[#f59e0b18] text-[#fbbf24] font-medium border border-[#f59e0b30]">
                          {certificates.length} {certificates.length === 1 ? "Certificate" : "Certificates"}
                        </span>
                      )}
                    </div>

                    {certificates && certificates.length > 0 ? (
                      <div className="space-y-3">
                        {certificates.map((cert) => (
                          <div
                            key={cert._id}
                            className="rounded-lg p-4 border border-[#2a2a2a] bg-[#0d0d0d] transition-colors hover:border-[#fbbf24]/50"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-xl">🏅</span>
                                  <h4 className="font-bold text-white text-base">
                                    {cert.title || "Certificate"}
                                  </h4>
                                </div>

                                <div className="flex gap-2 flex-wrap items-center text-xs">
                                  <span className="px-2 py-0.5 rounded-md bg-[#10b98115] text-[#34d399] font-medium">
                                    ✓ Issued
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-[#1f1f1f] text-[#999]">
                                    {new Date(cert.issued_date).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => previewCertificate(cert)}
                                  className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#333] text-[#ccc] hover:bg-[#1a1a1a] hover:text-white transition-colors"
                                  title="Preview certificate in new tab"
                                >
                                  👁️ Preview
                                </button>
                                <button
                                  onClick={() => downloadCertificate(cert)}
                                  disabled={certLoading}
                                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#fbbf24] text-black hover:bg-[#f59e0b] transition-colors disabled:opacity-50"
                                  title="Download certificate PNG"
                                >
                                  ⬇️ Download PNG
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Award size={32} className="mx-auto mb-2 text-[#555]" />
                        <p className="text-[#555] text-sm mb-2">
                          No certificates issued yet.
                        </p>
                        <p className="text-[#555] text-xs text-[#666]">
                          Certificates issued for your role or event participation will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                )}

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
