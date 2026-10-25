import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  User,
  Mail,
  GraduationCap,
  BookOpen,
  LogOut,
  Award,
  Calendar,
  BarChart3,
  Download,
} from "lucide-react";
import UserBlogsSection from "../../components/profile/UserBlogsSection";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState({
    total: 0,
    present: 0,
    percentage: 0,
  });
  const [certificates, setCertificates] = useState([]);
  const [downloadingCertId, setDownloadingCertId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    // Don't proceed if still waiting for auth
    if (authLoading) {
      return;
    }

    // Redirect admins and post holders to admin profile
    if (user.role === "admin" || user.role === "post_holder") {
      navigate("/admin/profile");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch profile
        const profileResponse = await api.get("/auth/profile");
        setProfile(profileResponse.data);

        // Fetch attendance summary
        try {
          const attendanceResponse = await api.get("/auth/attendance");
          const attendanceData = attendanceResponse.data || [];

          // Only count events where attendance was actually marked (present or absent)
          const markedEvents = Array.isArray(attendanceData)
            ? attendanceData.filter(
                (d) => d.status === "present" || d.status === "absent"
              )
            : [];

          const total = markedEvents.length;
          const present = markedEvents.filter(
            (d) => d.status === "present"
          ).length;
          const percentage =
            total > 0 ? Number(((present / total) * 100).toFixed(1)) : 0;

          setAttendance({
            total,
            present,
            percentage,
          });
        } catch (err) {
          console.warn("Could not fetch attendance:", err);
          // Fallback rule: default { total: 0, present: 0, percentage: 0 }
          setAttendance({ total: 0, present: 0, percentage: 0 });
        }

        // Fetch certificates for user
        try {
          const certificatesResponse = await api.get("/certificate/user/all");
          if (
            certificatesResponse.data &&
            Array.isArray(certificatesResponse.data.certificates)
          ) {
            setCertificates(certificatesResponse.data.certificates);
          } else {
            setCertificates([]);
          }
        } catch (err) {
          console.warn("Could not fetch certificates:", err);
          setCertificates([]);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const downloadCertificate = async (cert) => {
    setDownloadingCertId(cert._id);
    try {
      const endpoint = `/certificate/download/${cert._id}`;
      const safeTitle = (cert.title || "certificate")
        .replace(/[^a-z0-9_-]+/gi, "-")
        .toLowerCase();
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
      alert(
        "Failed to download certificate: " +
          (err.response?.data?.error || err.message)
      );
    } finally {
      setDownloadingCertId(null);
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
      alert(
        "Failed to preview certificate: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="text-white text-sm">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  // Derive role dynamically from profile response or JWT token
  const userRole = (profile?.role || user?.role || "student").toLowerCase();
  const isMember = userRole === "member";

  return (
    <div
      className="min-h-screen pt-20 pb-10 bg-[#0d0d0d] text-white"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-[#555]">Your account & activity overview</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info, Attendance, Certificates */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div
              className="rounded-xl border p-6"
              style={{ background: "#111111", borderColor: "#1f1f1f" }}
            >
              {/* Avatar & Name */}
              <div className="flex flex-col items-center text-center mb-6">
                <div
                  className={`w-20 h-20 rounded-full bg-linear-to-br ${
                    isMember
                      ? "from-pink-500 to-purple-500"
                      : "from-purple-500 to-blue-500"
                  } flex items-center justify-center mb-4 shadow-lg`}
                >
                  <User size={40} className="text-white" />
                </div>
                <h2 className="text-xl font-bold mb-1">
                  {profile?.name || "User"}
                </h2>
                <p className="text-[#555] text-xs">
                  ID: {user?._id?.substring(0, 12) ?? "..."}
                </p>
              </div>

              {/* Quick Info */}
              <div className="space-y-3 text-sm">
                {profile?.email && (
                  <div className="flex items-center gap-3">
                    <Mail
                      size={16}
                      className={isMember ? "text-pink-400" : "text-purple-400"}
                    />
                    <span className="text-[#999] truncate">
                      {profile.email.split("@")[0]}
                    </span>
                  </div>
                )}
                {profile?.branch && (
                  <div className="flex items-center gap-3">
                    <BookOpen size={16} className="text-blue-400" />
                    <span className="text-[#999]">{profile.branch}</span>
                  </div>
                )}
                {profile?.year && (
                  <div className="flex items-center gap-3">
                    <GraduationCap size={16} className="text-green-400" />
                    <span className="text-[#999]">Year {profile.year}</span>
                  </div>
                )}
                {profile?.roll_number && (
                  <div className="flex items-center gap-3">
                    <BarChart3 size={16} className="text-orange-400" />
                    <span className="text-[#999]">{profile.roll_number}</span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div
                className="mt-4 pt-4 border-t"
                style={{ borderColor: "#1f1f1f" }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isMember ? "bg-pink-500" : "bg-green-500"
                    }`}
                  />
                  <span className="text-xs text-[#999]">
                    <span className="capitalize">{userRole}</span> •{" "}
                    {profile?.email_verified ? "Verified" : "Unverified"}
                  </span>
                </div>
                {profile?.created_at && (
                  <p className="text-xs text-[#555] mt-2">
                    Joined{" "}
                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Attendance Card */}
            <div
              className="rounded-xl border p-6"
              style={{ background: "#111111", borderColor: "#1f1f1f" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ background: "#0ea5e918" }}
                >
                  <Calendar size={18} style={{ color: "#0ea5e9" }} />
                </div>
                <h3 className="font-semibold text-white">Event Attendance</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#555]">Attendance Rate</span>
                    <span className="font-bold text-lg text-cyan-400">
                      {attendance?.percentage ?? 0}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, attendance?.percentage ?? 0)
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-lg p-3"
                    style={{ background: "#0ea5e910" }}
                  >
                    <p className="text-xs text-[#555]">Total Events</p>
                    <p className="text-lg font-bold text-white">
                      {attendance?.total ?? 0}
                    </p>
                  </div>
                  <div
                    className="rounded-lg p-3"
                    style={{ background: "#10b98110" }}
                  >
                    <p className="text-xs text-[#555]">Attended</p>
                    <p className="text-lg font-bold text-green-400">
                      {attendance?.present ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificates Section */}
            <div
              className="rounded-xl border p-6 w-full"
              style={{ background: "#111111", borderColor: "#1f1f1f" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-3 text-white">
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: "#f59e0b18" }}
                  >
                    <Award size={18} style={{ color: "#f59e0b" }} />
                  </div>
                  My Certificates
                </h3>
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
                              {new Date(cert.issued_date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
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
                            disabled={downloadingCertId === cert._id}
                            className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#fbbf24] text-black hover:bg-[#f59e0b] transition-colors disabled:opacity-50 flex items-center gap-1"
                            title="Download certificate PNG"
                          >
                            <Download size={13} />
                            {downloadingCertId === cert._id
                              ? "Downloading..."
                              : "Download"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award size={32} className="mx-auto mb-2 text-[#555]" />
                  <p className="text-[#555] text-sm mb-1">
                    No certificates issued yet.
                  </p>
                  <p className="text-[#555] text-xs">
                    Attend events and workshops to earn certificates!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Account Info & My Blogs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information Section */}
            <div
              className="rounded-xl border p-6"
              style={{ background: "#111111", borderColor: "#1f1f1f" }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-3 text-white">
                <div
                  className="p-2 rounded-lg"
                  style={{ background: "#a855f718" }}
                >
                  <User size={18} style={{ color: "#a855f7" }} />
                </div>
                Account Information
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-[#555] text-sm mb-1">Full Name</p>
                  <p className="text-white font-medium">
                    {profile?.name || "N/A"}
                  </p>
                </div>

                <div className="border-t" style={{ borderColor: "#1f1f1f" }}>
                  <p className="text-[#555] text-sm mb-1 mt-3">Email Address</p>
                  <p className="text-white break-all">
                    {profile?.email || "N/A"}
                  </p>
                </div>

                {profile?.phone && (
                  <div className="border-t" style={{ borderColor: "#1f1f1f" }}>
                    <p className="text-[#555] text-sm mb-1 mt-3">Phone</p>
                    <p className="text-white">{profile.phone}</p>
                  </div>
                )}

                <div className="border-t" style={{ borderColor: "#1f1f1f" }}>
                  <p className="text-[#555] text-sm mb-1 mt-3">Role</p>
                  <p className="text-white capitalize">{userRole}</p>
                </div>

                <div className="border-t" style={{ borderColor: "#1f1f1f" }}>
                  <p className="text-[#555] text-sm mb-1 mt-3">
                    Email Verification
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        profile?.email_verified
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <p className="text-white capitalize">
                      {profile?.email_verified ? "Verified" : "Pending"}
                    </p>
                  </div>
                </div>

                <div className="border-t" style={{ borderColor: "#1f1f1f" }}>
                  <p className="text-[#555] text-sm mb-1 mt-3">Academic Info</p>
                  <div className="flex gap-2 text-sm flex-wrap items-center">
                    {profile?.branch && (
                      <span
                        className="px-2.5 py-1 rounded-md text-xs font-medium"
                        style={{ background: "#0ea5e915", color: "#38bdf8" }}
                      >
                        {profile.branch}
                      </span>
                    )}
                    {profile?.year && (
                      <span
                        className="px-2.5 py-1 rounded-md text-xs font-medium"
                        style={{ background: "#f59e0b15", color: "#fbbf24" }}
                      >
                        Year {profile.year}
                      </span>
                    )}
                    {profile?.roll_number && (
                      <span
                        className="px-2.5 py-1 rounded-md text-xs font-medium"
                        style={{ background: "#10b98115", color: "#34d399" }}
                      >
                        {profile.roll_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* My Blogs Section */}
            <UserBlogsSection userId={user?.id || user?._id || user?.userId} />
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-300 font-medium border text-sm"
            style={{
              background: "#ef444415",
              borderColor: "#ef444430",
              color: "#ef4444",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ef444425";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ef444415";
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
