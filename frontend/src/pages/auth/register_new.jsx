import React, { useState, useEffect } from "react";
import { Mail, Lock, User, Phone, BookOpen, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Register() {
  const nitkkrEmailRegex = /^[a-zA-Z0-9._%+-]+@nitkkr\.ac\.in$/i;
  const navigate = useNavigate();
  const { register, resendVerificationEmail } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    branch: "",
    year: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0); // Cooldown countdown in seconds

  const branches = [
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
  const years = ["1", "2", "3", "4"];

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!nitkkrEmailRegex.test(formData.email)) {
      setError("Only @nitkkr.ac.in email addresses are allowed.");
      setLoading(false);
      return;
    }

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.name,
        formData.phone,
        formData.branch,
        formData.year
      );

      if (result.success) {
        setSuccessMessage(
          result.message ||
            "Registration successful. Check your inbox for the verification link."
        );
        setSuccess(true);
        setResendCooldown(30); // Start 30-second cooldown after registration
        // Don't auto-redirect immediately, let user see options
      } else {
        setError(result.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage("");

    // Prevent if still in cooldown
    if (resendCooldown > 0) {
      setResendLoading(false);
      return;
    }

    try {
      const result = await resendVerificationEmail(formData.email);

      if (result.success) {
        setResendMessage(
          `${result.message} (Link expires in ${result.expiresIn})`
        );
        setResendCooldown(30); // Start 30-second cooldown after successful resend
      } else {
        // Check if error includes cooldown wait time
        if (result.error?.includes("Please wait")) {
          setResendMessage(result.error);
          // Extract wait time from error message (e.g., "Please wait 25 seconds")
          const match = result.error.match(/(\d+)\s+second/);
          if (match) {
            const waitSeconds = parseInt(match[1]);
            setResendCooldown(waitSeconds);
          }
        } else {
          setResendMessage(result.error);
        }
      }
    } catch (err) {
      setResendMessage("Failed to resend verification email. Try again.");
      console.error("Resend error:", err);
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] px-4 py-12">
        <div
          className="p-8 rounded-xl border text-center max-w-sm space-y-5"
          style={{
            background: "#111111",
            borderColor: "#10b98130",
          }}
        >
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-white">
            Registration Successful!
          </h2>
          <p className="text-sm text-[#555]">{successMessage}</p>

          {/* Resend button section - Always show button + message */}
          <div className="space-y-3 pt-4">
            <p className="text-xs text-[#777]">Didn't receive the email?</p>
            <button
              onClick={handleResendVerification}
              disabled={resendLoading || resendCooldown > 0}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background:
                  resendLoading || resendCooldown > 0
                    ? "#fbbf2415"
                    : "#fbbf2430",
                color: "#fbbf24",
                border: "1px solid #fbbf2420",
                opacity: resendLoading || resendCooldown > 0 ? 0.6 : 1,
                cursor:
                  resendLoading || resendCooldown > 0
                    ? "not-allowed"
                    : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!resendLoading && resendCooldown <= 0)
                  e.target.style.background = "#fbbf2440";
              }}
              onMouseLeave={(e) => {
                if (!resendLoading && resendCooldown <= 0)
                  e.target.style.background = "#fbbf2430";
              }}
            >
              {resendLoading
                ? "Sending Email..."
                : resendCooldown > 0
                ? `Wait ${resendCooldown}s`
                : "Resend Verification Email"}
            </button>

            {/* Resend status message - Always shown when present */}
            {resendMessage && (
              <div
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  background: resendMessage.includes("successfully")
                    ? "#10b98115"
                    : "#ef444415",
                  color: resendMessage.includes("successfully")
                    ? "#10b981"
                    : "#ef4444",
                  border: "1px solid",
                  borderColor: resendMessage.includes("successfully")
                    ? "#10b98130"
                    : "#ef444430",
                }}
              >
                {resendMessage}
              </div>
            )}
          </div>

          {/* Continue to login button */}
          <div className="pt-4 border-t" style={{ borderColor: "#1f1f1f" }}>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: "#a855f740",
                color: "#a855f7",
                border: "1px solid #a855f730",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#a855f750";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#a855f740";
              }}
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] px-4 py-12">
      <div
        className="w-full max-w-md space-y-6 bg-[#111111] p-6 rounded-xl border"
        style={{ borderColor: "#1f1f1f" }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Create Account
          </h2>
          <p className="mt-1 text-sm text-[#555]">Join the iCell community</p>
        </div>

        {error && (
          <div
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              background: "#ef444415",
              borderColor: "#ef444430",
              color: "#ef4444",
              border: "1px solid #ef444430",
            }}
          >
            {error}
          </div>
        )}

        <form className="space-y-3" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-white mb-1">
              Full Name
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-3 text-[#555]" />
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg text-white placeholder-[#555] text-sm focus:outline-none focus:border-purple-500"
                placeholder="Full name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-white mb-1">
              Email
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3 text-[#555]" />
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg text-white placeholder-[#555] text-sm focus:outline-none focus:border-purple-500"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-white mb-1">
              Phone
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-3 text-[#555]" />
              <input
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg text-white placeholder-[#555] text-sm focus:outline-none focus:border-purple-500"
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          {/* Branch & Year - Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Branch */}
            <div>
              <label className="block text-xs font-medium text-white mb-1">
                Branch
              </label>
              <div className="relative">
                <BookOpen
                  size={14}
                  className="absolute left-3 top-3 text-[#555]"
                />
                <select
                  name="branch"
                  required
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs font-medium text-white mb-1">
                Year
              </label>
              <div className="relative">
                <GraduationCap
                  size={14}
                  className="absolute left-3 top-3 text-[#555]"
                />
                <select
                  name="year"
                  required
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                >
                  <option value="">Select</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      Year {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-white mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3 text-[#555]" />
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg text-white placeholder-[#555] text-sm focus:outline-none focus:border-purple-500"
                placeholder="Min 8 characters"
                minLength="8"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 mt-4"
            style={{
              background: loading ? "#a855f730" : "#a855f740",
              color: "#a855f7",
              border: "1px solid #a855f730",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.background = "#a855f750";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.background = "#a855f740";
            }}
          >
            {loading ? "Creating..." : "Register"}
          </button>

          {/* Login Link */}
          <p className="text-center text-xs text-[#555]">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-purple-400 font-medium hover:text-purple-300"
            >
              Sign In
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
