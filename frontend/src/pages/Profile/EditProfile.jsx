import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import {
  User,
  Mail,
  GraduationCap,
  BookOpen,
  Phone,
  Hash,
  ArrowLeft,
  Check,
  AlertCircle,
  Lock,
  Save,
  Loader2,
} from "lucide-react";

const NIT_BRANCHES = [
  "CSE",
  "IT",
  "AIDS",
  "AIML",
  "MnC",
  "ECE",
  "ME",
  "Civil",
  "EE",
  "PIE",
  "IIOT",
  "SET",
  "Robotics",
  "Others",
];

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Editable fields only
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [phone, setPhone] = useState("");

  // Read-only / Reference fields
  const [initialData, setInitialData] = useState(null);
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [year, setYear] = useState("");
  const [userRole, setUserRole] = useState("student");
  const [postPosition, setPostPosition] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Wait for auth to complete
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (authLoading) return;

    const fetchCurrentProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        const data = res.data;

        setName(data.name || "");
        setBranch(data.branch || "");
        setPhone(data.phone || "");

        setEmail(data.email || "");
        setRollNumber(data.roll_number || "");
        setYear(data.year || "");
        setUserRole((data.role || user.role || "student").toLowerCase());
        setPostPosition(data.post_position || "");
        setIsVerified(data.email_verified === true);

        setInitialData({
          name: data.name || "",
          branch: data.branch || "",
          phone: data.phone || "",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Unable to load profile information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentProfile();
  }, [authLoading, user, navigate]);

  const hasChanges =
    initialData &&
    (name.trim() !== initialData.name ||
      branch.trim() !== initialData.branch ||
      phone.trim() !== initialData.phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validations
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError("Full name must be at least 2 characters long.");
      return;
    }
    if (trimmedName.length > 100) {
      setError("Full name cannot exceed 100 characters.");
      return;
    }

    const trimmedBranch = branch.trim();
    if (!trimmedBranch && userRole !== "admin") {
      setError("Please select or enter your branch.");
      return;
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone) {
      const digitsOnly = trimmedPhone.replace(/[^0-9]/g, "");
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        setError("Please enter a valid phone number (10 to 15 digits).");
        return;
      }
    }

    if (!hasChanges) {
      setError("No changes were made to your profile.");
      return;
    }

    setSaving(true);
    try {
      await api.put("/auth/profile", {
        name: trimmedName,
        branch: trimmedBranch,
        phone: trimmedPhone,
      });

      setSuccess(true);
      // Brief pause to show confirmation before redirecting back
      setTimeout(() => {
        navigate("/profile");
      }, 1200);
    } catch (err) {
      console.error("Update profile error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to update profile. Please check your inputs and try again."
      );
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] text-white">
        <div className="flex items-center gap-3 text-sm text-[#888]">
          <Loader2 size={18} className="animate-spin text-purple-400" />
          Loading profile details...
        </div>
      </div>
    );
  }

  const isMember = userRole === "member";

  // Build branch list including current branch if custom
  const branchOptions =
    branch && !NIT_BRANCHES.includes(branch)
      ? [branch, ...NIT_BRANCHES]
      : NIT_BRANCHES;

  return (
    <div
      className="min-h-screen pt-24 pb-16 bg-[#0d0d0d] text-white"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <div className="max-w-2xl mx-auto px-4">
        {/* Navigation & Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/profile")}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#888] hover:text-white transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Profile
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
                Edit Profile
              </h1>
              <p className="text-[#666] text-xs sm:text-sm">
                Update your personal name, branch, and contact number
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-full bg-linear-to-br ${
                userRole === "admin"
                  ? "from-rose-500 to-amber-500 shadow-[0_0_16px_rgba(244,63,94,0.35)]"
                  : userRole === "post_holder"
                  ? "from-indigo-500 to-violet-500 shadow-[0_0_16px_rgba(99,102,241,0.35)]"
                  : isMember
                  ? "from-pink-500 to-purple-500 shadow-[0_0_16px_rgba(236,72,153,0.35)]"
                  : "from-purple-500 to-blue-500 shadow-[0_0_16px_rgba(99,102,241,0.3)]"
              } flex items-center justify-center shrink-0`}
            >
              <User size={24} className="text-white" />
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3 text-sm text-red-300">
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3 text-sm text-emerald-300">
            <Check size={18} className="text-emerald-400 shrink-0" />
            <p>Profile updated successfully! Redirecting back to your profile...</p>
          </div>
        )}

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border p-6 sm:p-8 space-y-6"
          style={{ background: "#111111", borderColor: "#1f1f1f" }}
        >
          {/* Section: Editable Fields */}
          <div>
            <h2 className="text-sm font-semibold text-[#bbb] uppercase tracking-wider mb-4">
              Editable Details
            </h2>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-[#aaa] mb-1.5">
                  Full Name <span className="text-purple-400">*</span>
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666]"
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    maxLength={100}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0d0d0d] border border-[#262626] text-sm text-white focus:outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder-[#444]"
                  />
                </div>
                <p className="text-[11px] text-[#555] mt-1">
                  Shown on your certificates, blog posts, and attendance records.
                </p>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-xs font-medium text-[#aaa] mb-1.5">
                  Academic Branch {userRole !== "admin" ? <span className="text-purple-400">*</span> : <span className="text-[#666]">(Optional for Admin)</span>}
                </label>
                <div className="relative">
                  <BookOpen
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666]"
                  />
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required={userRole !== "admin"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0d0d0d] border border-[#262626] text-sm text-white focus:outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/30 transition-all cursor-pointer"
                  >
                    <option value="" disabled={userRole !== "admin"}>
                      {userRole === "admin" ? "None / Administration" : "Select your department/branch"}
                    </option>
                    {branchOptions.map((b) => (
                      <option key={b} value={b} className="bg-[#141414] text-white">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-medium text-[#aaa] mb-1.5">
                  Phone Number <span className="text-[#666]">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666]"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    maxLength={15}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0d0d0d] border border-[#262626] text-sm text-white focus:outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/30 transition-all placeholder-[#444]"
                  />
                </div>
                <p className="text-[11px] text-[#555] mt-1">
                  Used for society notices and official event coordination.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#1c1c1c] pt-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">
                System Maintained (Read Only)
              </h2>
              <span className="flex items-center gap-1 text-[11px] text-[#666]">
                <Lock size={11} />
                Locked for integrity
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Email Address */}
              <div className="p-3 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a]">
                <div className="flex items-center justify-between text-xs text-[#666] mb-1">
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} />
                    College Email
                  </span>
                  <Lock size={12} className="text-[#555]" />
                </div>
                <p className="text-xs font-medium text-[#aaa] truncate" title={email}>
                  {email || "N/A"}
                </p>
              </div>

              {/* Roll Number */}
              <div className="p-3 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a]">
                <div className="flex items-center justify-between text-xs text-[#666] mb-1">
                  <span className="flex items-center gap-1.5">
                    <Hash size={13} />
                    Roll Number
                  </span>
                  <Lock size={12} className="text-[#555]" />
                </div>
                <p className="text-xs font-medium text-[#aaa]">
                  {rollNumber || "N/A"}
                </p>
              </div>

              {/* Academic Year */}
              <div className="p-3 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a]">
                <div className="flex items-center justify-between text-xs text-[#666] mb-1">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap size={13} />
                    Academic Year
                  </span>
                  <Lock size={12} className="text-[#555]" />
                </div>
                <p className="text-xs font-medium text-[#aaa]">
                  {year ? `Year ${year}` : "N/A"}
                </p>
              </div>

              {/* Role Status */}
              <div className="p-3 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a]">
                <div className="flex items-center justify-between text-xs text-[#666] mb-1">
                  <span className="flex items-center gap-1.5">
                    <User size={13} />
                    Membership Role
                  </span>
                  <Lock size={12} className="text-[#555]" />
                </div>
                <p className="text-xs font-medium capitalize text-[#aaa]">
                  {userRole === "post_holder"
                    ? `Post Holder${postPosition ? ` (${postPosition})` : ""}`
                    : userRole.replace("_", " ")}{" "}
                  • {isVerified || userRole === "admin" ? "Verified" : "Unverified"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-[#1c1c1c] pt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              disabled={saving}
              className="px-4 py-2.5 rounded-lg border border-[#2a2a2a] text-xs font-medium text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
