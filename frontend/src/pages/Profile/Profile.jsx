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
  Download,
  Phone,
  Copy,
  Check,
  AlertCircle,
  Pencil,
  LayoutDashboard,
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
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);

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

  const handleCopyEmail = () => {
    if (!profile?.email) return;
    navigator.clipboard.writeText(profile.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleResendVerification = async () => {
    if (!profile?.email) return;
    setResendingEmail(true);
    setResendStatus(null);
    try {
      const res = await api.post("/auth/resend-verification-email", {
        email: profile.email,
      });
      setResendStatus({
        type: "success",
        message: res.data?.message || "Verification email sent! Check your inbox.",
      });
    } catch (err) {
      setResendStatus({
        type: "error",
        message:
          err.response?.data?.error ||
          "Failed to resend verification email. Please try again later.",
      });
    } finally {
      setResendingEmail(false);
    }
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
  const isAdmin = userRole === "admin";
  const isPostHolder = userRole === "post_holder";
  const isMember = userRole === "member";
  const isVerified = profile?.email_verified === true;

  return (
    <div
      className="min-h-screen pt-20 pb-16 bg-[#0d0d0d] text-white"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with Relocated Sign Out Button & Admin Dashboard Shortcut */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1 tracking-tight">Profile</h1>
            <p className="text-[#666] text-sm">Your account & activity overview</p>
          </div>
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {(isAdmin || isPostHolder) && (
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 hover:text-white border border-white/10 transition-all text-xs font-medium cursor-pointer"
              >
                <LayoutDashboard size={15} className="text-purple-400" />
                Admin Dashboard
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium border text-xs cursor-pointer"
              style={{
                background: "#ef444415",
                borderColor: "#ef444430",
                color: "#f87171",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ef444425";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ef444415";
              }}
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Unverified Email Action Banner (Point 3 - not shown for admin) */}
        {!isVerified && !isAdmin && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <div className="flex items-start sm:items-center gap-3">
              <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="text-amber-200 font-medium">Your email is not verified</p>
                <p className="text-amber-300/70 text-xs mt-0.5">
                  Verify your @nitkkr.ac.in email address to access all student member privileges.
                </p>
                {resendStatus && (
                  <p
                    className={`text-xs mt-1.5 font-medium ${
                      resendStatus.type === "success" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {resendStatus.message}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleResendVerification}
              disabled={resendingEmail}
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 text-black hover:bg-amber-300 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              {resendingEmail ? "Sending..." : "Resend Verification Email"}
            </button>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (lg:col-span-1) - Identity & Attendance */}
          <div className="lg:col-span-1 space-y-6">
            {/* Identity Card (Point 1, Point 2, Suggestion 1) */}
            <div
              className="rounded-xl border p-6"
              style={{ background: "#111111", borderColor: "#1f1f1f" }}
            >
              {/* Avatar & Name */}
              <div className="flex flex-col items-center text-center mb-5">
                <div
                  className={`w-20 h-20 rounded-full bg-linear-to-br ${
                    isAdmin
                      ? "from-rose-500 to-amber-500 shadow-[0_0_24px_rgba(244,63,94,0.35)]"
                      : isPostHolder
                      ? "from-indigo-500 to-violet-500 shadow-[0_0_24px_rgba(99,102,241,0.35)]"
                      : isMember
                      ? "from-pink-500 to-purple-500 shadow-[0_0_24px_rgba(236,72,153,0.35)]"
                      : "from-purple-500 to-blue-500 shadow-[0_0_24px_rgba(99,102,241,0.3)]"
                  } flex items-center justify-center mb-3.5`}
                >
                  <User size={40} className="text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">
                  {profile?.name || (isAdmin ? "Admin" : isPostHolder ? "Post Holder" : "User")}
                </h2>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#161616] border border-[#242424]">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isAdmin
                        ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                        : isPostHolder
                        ? "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]"
                        : isMember
                        ? "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]"
                        : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                    }`}
                  />
                  <span className="capitalize text-white/90">
                    {isPostHolder
                      ? `Post Holder${profile?.post_position ? ` (${profile.post_position})` : ""}`
                      : userRole}
                  </span>
                  <span className="text-[#555]">•</span>
                  <span className={isVerified || isAdmin ? "text-emerald-400" : "text-amber-400"}>
                    {isVerified || isAdmin ? "Verified" : "Unverified"}
                  </span>
                </div>

                {/* Academic Metadata Pills (Rendered only if values exist) */}
                {(profile?.branch || profile?.year || profile?.roll_number) && (
                  <div className="flex gap-2 text-xs flex-wrap justify-center mt-3.5">
                    {profile?.branch && (
                      <span
                        className="px-2.5 py-1 rounded-md font-medium"
                        style={{ background: "#0ea5e915", color: "#38bdf8" }}
                      >
                        {profile.branch}
                      </span>
                    )}
                    {profile?.year && (
                      <span
                        className="px-2.5 py-1 rounded-md font-medium"
                        style={{ background: "#f59e0b15", color: "#fbbf24" }}
                      >
                        Year {profile.year}
                      </span>
                    )}
                    {profile?.roll_number && (
                      <span
                        className="px-2.5 py-1 rounded-md font-medium"
                        style={{ background: "#10b98115", color: "#34d399" }}
                      >
                        {profile.roll_number}
                      </span>
                    )}
                  </div>
                )}

                {/* Edit Profile Button on Card */}
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="mt-3.5 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#262626] bg-[#141414] hover:bg-[#1c1c1c] text-xs font-medium text-white/80 hover:text-white transition-all cursor-pointer"
                >
                  <Pencil size={12} className="text-purple-400" />
                  Edit Profile
                </button>
              </div>

              {/* Contact Information (Point 2: Real email with copy action) */}
              <div className="pt-4 border-t space-y-2.5" style={{ borderColor: "#1f1f1f" }}>
                {profile?.email && (
                  <div className="flex items-center justify-between gap-2.5 text-xs p-2.5 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f]">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Mail size={15} className="text-[#888] shrink-0" />
                      <span className="text-[#ccc] truncate" title={profile.email}>
                        {profile.email}
                      </span>
                    </div>
                    <button
                      onClick={handleCopyEmail}
                      title="Copy email to clipboard"
                      className="text-[#666] hover:text-white transition-colors shrink-0 p-1 cursor-pointer"
                    >
                      {copiedEmail ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                )}

                {profile?.phone && (
                  <div className="flex items-center gap-2.5 text-xs p-2.5 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f]">
                    <Phone size={15} className="text-[#888] shrink-0" />
                    <span className="text-[#ccc]">{profile.phone}</span>
                  </div>
                )}

                {profile?.created_at && (
                  <p className="text-xs text-[#555] text-center pt-1.5">
                    Member since{" "}
                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Attendance Card (UNTOUCHED: Exactly preserved as requested) */}
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
          </div>

          {/* Right Column (lg:col-span-2) - Certificates & My Blogs (Suggestion 2) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Certificates Section (Moved to right column with ample space & Suggestion 5 empty state) */}
            <div
              className="rounded-xl border p-6 w-full"
              style={{ background: "#111111", borderColor: "#1f1f1f" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: "#f59e0b18" }}
                  >
                    <Award size={18} style={{ color: "#f59e0b" }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">My Certificates</h3>
                    <p className="text-xs text-[#666]">
                      Official credentials earned from events & workshops
                    </p>
                  </div>
                </div>

                {certificates && certificates.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f59e0b15] text-[#fbbf24] border border-[#f59e0b30]">
                    {certificates.length} {certificates.length === 1 ? "Certificate" : "Certificates"}
                  </span>
                )}
              </div>

              {certificates && certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {certificates.map((cert) => (
                    <div
                      key={cert._id}
                      className="rounded-lg p-4 border border-[#262626] bg-[#0d0d0d] transition-all hover:border-[#fbbf24]/50 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-xl shrink-0">🏅</span>
                          <h4 className="font-bold text-white text-sm line-clamp-2">
                            {cert.title || "Certificate"}
                          </h4>
                        </div>

                        <div className="flex gap-2 flex-wrap items-center text-xs mb-4">
                          <span className="px-2 py-0.5 rounded-md bg-[#10b98115] text-[#34d399] font-medium">
                            ✓ Issued
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#1a1a1a] text-[#888]">
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

                      <div className="flex items-center gap-2 pt-3 border-t border-[#1c1c1c]">
                        <button
                          onClick={() => previewCertificate(cert)}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#333] text-[#ccc] hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer text-center"
                          title="Preview certificate in new tab"
                        >
                          👁️ Preview
                        </button>
                        <button
                          onClick={() => downloadCertificate(cert)}
                          disabled={downloadingCertId === cert._id}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#fbbf24] text-black hover:bg-[#f59e0b] transition-colors disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer text-center"
                          title="Download certificate PNG"
                        >
                          <Download size={13} />
                          {downloadingCertId === cert._id
                            ? "Downloading..."
                            : "Download"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Suggestion 5: Actionable Empty State */
                <div className="text-center py-10 px-4 rounded-xl border border-dashed border-[#262626] bg-[#0d0d0d]/40">
                  <div className="w-12 h-12 rounded-full bg-[#f59e0b12] text-[#f59e0b] flex items-center justify-center mx-auto mb-3">
                    <Award size={24} />
                  </div>
                  <h4 className="text-white font-medium text-sm mb-1">
                    No certificates issued yet
                  </h4>
                  <p className="text-[#666] text-xs max-w-sm mx-auto mb-4">
                    Attend events and workshops organized by iCELL to earn official participation certificates.
                  </p>
                  <button
                    onClick={() => navigate("/events")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors border border-white/10 cursor-pointer"
                  >
                    Explore Events →
                  </button>
                </div>
              )}
            </div>

            {/* My Blogs Section */}
            <UserBlogsSection userId={user?.id || user?._id || user?.userId} />
          </div>
        </div>
      </div>
    </div>
  );
}
