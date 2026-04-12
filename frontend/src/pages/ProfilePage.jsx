import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  User,
  Mail,
  GraduationCap,
  BookOpen,
  LogOut,
  Award,
  CheckCircle,
  Calendar,
  BarChart3,
  Phone,
  MapPin,
  Download,
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [memberCertLoading, setMemberCertLoading] = useState(false);
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

    const fetchData = async () => {
      try {
        // Fetch profile
        const profileResponse = await api.get("/auth/profile");
        setProfile(profileResponse.data);

        // Fetch attendance summary
        try {
          const attendanceResponse = await api.get("/auth/attendance");
          const attendanceData = attendanceResponse.data || [];
          const total = attendanceData.length;
          const present = attendanceData.filter(
            (d) => d.status === "present"
          ).length;
          const percentage =
            total > 0 ? ((present / total) * 100).toFixed(1) : 0;
          setAttendance({
            total,
            present,
            percentage,
          });
        } catch (err) {
          console.warn("Could not fetch attendance:", err);
          // Don't set dummy data - leave it null
          setAttendance(null);
        }

        // Fetch certificates for user
        try {
          const certificatesResponse = await api.get("/certificate/user/all");
          console.log("Certificates API Response:", certificatesResponse.data);
          if (
            certificatesResponse.data &&
            certificatesResponse.data.certificates
          ) {
            setCertificates(certificatesResponse.data.certificates);
            console.log(
              "Certificates set:",
              certificatesResponse.data.certificates
            );
          } else {
            console.warn("No certificates in response");
            setCertificates([]);
          }
        } catch (err) {
          console.warn("Could not fetch certificates:", err);
          setCertificates([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
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
    setMemberCertLoading(true);
    try {
      let endpoint = "";
      let filename = "";

      // Determine endpoint based on certificate type
      if (cert.certificate_type === "member") {
        endpoint = "/certificate/member/download";
        filename = `icell-member-certificate-${profile?.name?.replace(
          /\s+/g,
          "-"
        )}.svg`;
      } else if (cert.certificate_type === "post_holder") {
        endpoint = "/certificate/postholder/download";
        filename = `icell-post-holder-certificate-${profile?.name?.replace(
          /\s+/g,
          "-"
        )}.svg`;
      } else if (cert.certificate_type === "event") {
        endpoint = `/certificate/event/download/${cert._id}`;
        filename = `icell-achievement-certificate-${cert.metadata?.achievement
          ?.replace(/\s+/g, "-")
          .toLowerCase()}.svg`;
      }

      const response = await api.get(endpoint, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download certificate:", err);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setMemberCertLoading(false);
    }
  };

  const previewCertificate = async (cert) => {
    try {
      const response = await api.get(`/certificate/preview/${cert._id}`);
      // Open preview in new tab
      const newWindow = window.open();
      newWindow.document.write(response.data);
      newWindow.document.close();
    } catch (err) {
      console.error("Failed to preview certificate:", err);
      alert("Failed to load certificate preview.");
    }
  };

  if (!user) return null;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

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
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div
              className="rounded-xl border p-6"
              style={{ background: "#111111", borderColor: "#1f1f1f" }}
            >
              {/* Avatar & Name */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4">
                  <User size={40} className="text-white" />
                </div>
                <h2 className="text-xl font-bold mb-1">
                  {profile?.name || "User"}
                </h2>
                <p className="text-[#555] text-sm">
                  ID: {user?._id?.substring(0, 12) ?? "..."}
                </p>
              </div>

              {/* Quick Info */}
              <div className="space-y-3 text-sm">
                {profile?.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-purple-400" />
                    <span className="text-[#999]">
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
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-[#999]">
                    {profile?.is_member ? "Active Member" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs text-[#555] mt-2">
                  Joined{" "}
                  {new Date(profile?.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Attendance Card */}
            {attendance !== null ? (
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
                  <h3 className="font-semibold">Event Attendance</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[#555]">
                        Attendance Rate
                      </span>
                      <span className="font-bold text-lg text-cyan-400">
                        {attendance.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-cyan-500 to-blue-500"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, attendance.percentage)
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
                        {attendance.total}
                      </p>
                    </div>
                    <div
                      className="rounded-lg p-3"
                      style={{ background: "#10b98110" }}
                    >
                      <p className="text-xs text-[#555]">Attended</p>
                      <p className="text-lg font-bold text-green-400">
                        {attendance.present}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
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
                  <h3 className="font-semibold">Event Attendance</h3>
                </div>
                <div className="text-center py-8">
                  <p className="text-[#555] text-sm">
                    No attendance records yet. Attend events to see your
                    attendance tracking!
                  </p>
                </div>
              </div>
            )}

            {/* Certificates Section */}
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
              </div>

              {/* Always show the section, even if empty */}
              {certificates && certificates.length > 0 ? (
                <div>
                  {/* Certificate Statistics */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div
                      className="rounded-lg p-3 text-center"
                      style={{ background: "#0d0d0d" }}
                    >
                      <p className="text-[#555] text-xs mb-1">Member</p>
                      <p className="text-lg font-bold text-[#fbbf24]">
                        {
                          certificates.filter(
                            (c) => c.certificate_type === "member"
                          ).length
                        }
                      </p>
                    </div>
                    <div
                      className="rounded-lg p-3 text-center"
                      style={{ background: "#0d0d0d" }}
                    >
                      <p className="text-[#555] text-xs mb-1">Post Holder</p>
                      <p className="text-lg font-bold text-[#e94560]">
                        {
                          certificates.filter(
                            (c) => c.certificate_type === "post_holder"
                          ).length
                        }
                      </p>
                    </div>
                    <div
                      className="rounded-lg p-3 text-center"
                      style={{ background: "#0d0d0d" }}
                    >
                      <p className="text-[#555] text-xs mb-1">Achievements</p>
                      <p className="text-lg font-bold text-[#06b6d4]">
                        {
                          certificates.filter(
                            (c) => c.certificate_type === "event"
                          ).length
                        }
                      </p>
                    </div>
                  </div>

                  {/* Certificates List */}
                  <div className="space-y-3">
                    {certificates.map((cert) => {
                      let borderColor = "#1f1f1f";
                      let badgeColor = "#666";
                      let badgeBg = "#66666610";
                      let icon = "📜";

                      if (cert.certificate_type === "member") {
                        borderColor = "#fbbf24";
                        badgeColor = "#fbbf24";
                        badgeBg = "#fbbf2415";
                        icon = "🎖️";
                      } else if (cert.certificate_type === "post_holder") {
                        borderColor = "#e94560";
                        badgeColor = "#e94560";
                        badgeBg = "#e9456015";
                        icon = "👑";
                      } else if (cert.certificate_type === "event") {
                        borderColor = "#06b6d4";
                        badgeColor = "#06b6d4";
                        badgeBg = "#06b6d415";
                        icon = "⭐";
                      }

                      return (
                        <div
                          key={cert._id}
                          className="rounded-lg p-4 border"
                          style={{
                            background: "#0d0d0d",
                            borderColor: borderColor,
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">{icon}</span>
                                <h4 className="font-bold text-white">
                                  {cert.certificate_type === "member"
                                    ? "Member Certificate"
                                    : cert.certificate_type === "post_holder"
                                    ? "Post Holder Certificate"
                                    : "Achievement Certificate"}
                                </h4>
                              </div>

                              {cert.certificate_type === "event" &&
                                cert.metadata?.achievement && (
                                  <p className="text-[#999] text-sm mb-2">
                                    For:{" "}
                                    <strong>{cert.metadata.achievement}</strong>
                                  </p>
                                )}

                              {cert.certificate_type === "post_holder" &&
                                cert.metadata?.post_position && (
                                  <p className="text-[#999] text-sm mb-2">
                                    Position:{" "}
                                    <strong>
                                      {cert.metadata.post_position}
                                    </strong>
                                  </p>
                                )}

                              <div className="flex gap-2 flex-wrap">
                                <span
                                  className="text-xs px-2 py-1 rounded-md"
                                  style={{
                                    background: badgeBg,
                                    color: badgeColor,
                                  }}
                                >
                                  ✓ Issued
                                </span>
                                <span
                                  className="text-xs px-2 py-1 rounded-md"
                                  style={{
                                    background: "#66666610",
                                    color: "#999",
                                  }}
                                >
                                  {new Date(
                                    cert.issued_date
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => previewCertificate(cert)}
                                className="px-3 py-2 rounded-lg text-white text-sm font-medium transition-all whitespace-nowrap"
                                style={{
                                  background: "#66666615",
                                  color: "#999",
                                }}
                                title="Preview certificate"
                              >
                                👁️ Preview
                              </button>
                              <button
                                onClick={() => downloadCertificate(cert)}
                                disabled={memberCertLoading}
                                className="px-3 py-2 rounded-lg text-white text-sm font-medium transition-all whitespace-nowrap"
                                style={{
                                  background: memberCertLoading
                                    ? "#6b7280"
                                    : `linear-gradient(135deg, ${borderColor} 0%, ${borderColor}dd 100%)`,
                                  color: memberCertLoading
                                    ? "#ffffff"
                                    : cert.certificate_type === "member"
                                    ? "#000000"
                                    : "#ffffff",
                                }}
                                title={`Download ${cert.certificate_type} certificate`}
                              >
                                ⬇️{" "}
                                {memberCertLoading
                                  ? "Downloading..."
                                  : "Download"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award size={32} className="mx-auto mb-2 text-[#555]" />
                  <p className="text-[#555] text-sm mb-2">
                    No certificates issued yet.
                  </p>
                  <p className="text-[#555] text-xs">
                    Complete events and get promoted to earn certificates!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information Section */}
            <div
              className="rounded-xl border p-6"
              style={{ background: "#111111", borderColor: "#1f1f1f" }}
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
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
                  <p className="text-white">{profile?.name || "N/A"}</p>
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
                  <p className="text-white capitalize">
                    {profile?.role === "post_holder"
                      ? "Post Holder"
                      : profile?.role || "Member"}
                  </p>
                  {profile?.post_position && (
                    <p className="text-[#999] text-xs mt-1">
                      ({profile.post_position})
                    </p>
                  )}
                </div>

                <div className="border-t" style={{ borderColor: "#1f1f1f" }}>
                  <p className="text-[#555] text-sm mb-1 mt-3">Academic Info</p>
                  <div className="flex gap-3 text-sm">
                    {profile?.branch && (
                      <span
                        className="px-2.5 py-1 rounded-md"
                        style={{ background: "#0ea5e915" }}
                      >
                        {profile.branch}
                      </span>
                    )}
                    {profile?.year && (
                      <span
                        className="px-2.5 py-1 rounded-md"
                        style={{ background: "#f59e0b15" }}
                      >
                        Year {profile.year}
                      </span>
                    )}
                    {profile?.roll_number && (
                      <span
                        className="px-2.5 py-1 rounded-md"
                        style={{ background: "#10b98115" }}
                      >
                        {profile.roll_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 font-medium border"
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
    </div>
  );
}
