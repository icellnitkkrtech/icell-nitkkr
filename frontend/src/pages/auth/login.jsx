import React, { useEffect, useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, resendVerificationEmail } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0); // Cooldown countdown in seconds

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "1") {
      setInfo("Email verified successfully. You can now sign in.");
    } else if (verified === "0") {
      setInfo(
        "Verification link is invalid or expired. Please register again."
      );
    }
  }, [searchParams]);

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

    try {
      const result = await login(formData.email, formData.password);

      if (!result.success) {
        // Check if error is about email verification
        if (result.error?.includes("verify your email")) {
          setError(result.error);
        } else {
          setError(result.error);
        }
        setLoading(false);
        return;
      }

      const loggedInUser = result.user;
      setLoading(false);

      // Redirect based on role
      if (loggedInUser?.role === "admin") {
        navigate("/admin");
      } else if (loggedInUser?.role === "post_holder") {
        navigate("/admin");
      } else if (loggedInUser?.role === "member") {
        navigate("/member-profile");
      } else if (loggedInUser?.role === "student") {
        navigate("/student-profile");
      } else {
        // Fallback to home if role is not recognized
        navigate("/");
      }
    } catch (err) {
      setLoading(false);
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setResendMessage("Please enter your email address first.");
      return;
    }

    // Prevent if still in cooldown
    if (resendCooldown > 0) {
      return;
    }

    setResendLoading(true);
    setResendMessage("");

    try {
      const result = await resendVerificationEmail(formData.email);

      if (result.success) {
        setResendMessage(
          `${result.message} (Link expires in ${result.expiresIn})`
        );
        setResendCooldown(30); // Start 30-second cooldown after successful resend
        setError(""); // Clear error message
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] px-4 py-12">
      <div
        className="w-full max-w-md space-y-6 bg-[#111111] p-6 rounded-xl border"
        style={{ borderColor: "#1f1f1f" }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Sign In
          </h2>
          <p className="mt-1 text-sm text-[#555]">Access your account</p>
        </div>

        {error && (
          <div className="space-y-3">
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

            {/* Resend button if email verification error */}
            {error?.includes("verify your email") && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading || resendCooldown > 0}
                className="w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
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
                  ? "Sending..."
                  : resendCooldown > 0
                  ? `Wait ${resendCooldown}s`
                  : "Resend Verification Email"}
              </button>
            )}

            {/* Resend status message */}
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
        )}

        {info && (
          <div
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              background: "#10b98115",
              borderColor: "#10b98130",
              color: "#10b981",
              border: "1px solid #10b98130",
            }}
          >
            {info}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">
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
                className="w-full pl-9 pr-3 py-2.5 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg text-white placeholder-[#555] text-sm focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-white mb-1.5">
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
                className="w-full pl-9 pr-3 py-2.5 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg text-white placeholder-[#555] text-sm focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => (window.location.href = "/forgot-password")}
                className="text-xs text-[#a855f7] hover:text-[#9333ea] transition"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 mt-6"
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
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Register Link */}
          <p className="text-center text-xs text-[#555]">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
            >
              Register
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
