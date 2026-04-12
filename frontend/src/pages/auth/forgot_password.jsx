import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { forgotPassword, verifyResetToken, resetPassword, resendResetLink } =
    useAuth();

  // Get token from URL if present
  const tokenFromUrl = searchParams.get("token");

  // States for Step 1: Email Request
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);

  // States for Step 2: Token Verification
  const [step, setStep] = useState(1); // 1: Email, 2: Token Verify, 3: Reset Password
  const [tokenValid, setTokenValid] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(
    tokenFromUrl ? true : false
  );

  // States for Step 3: New Password Form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Cooldown timer effect
  useEffect(() => {
    if (resetCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResetCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resetCooldown]);

  // Verify token on mount if token in URL
  useEffect(() => {
    if (tokenFromUrl && verifyingToken) {
      verifyTokenAndMoveToStep3();
    }
  }, []);

  const verifyTokenAndMoveToStep3 = async () => {
    try {
      const result = await verifyResetToken(tokenFromUrl);

      if (result.valid) {
        setTokenValid(true);
        setStep(3);
      } else {
        setStep(2);
        setPasswordError(
          result.message ||
            "Your reset link has expired. Please request a new one."
        );
      }
    } catch (error) {
      setPasswordError("Failed to verify token");
    } finally {
      setVerifyingToken(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setEmailMessage("");

    // Validate email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@nitkkr\.ac\.in$/i;
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid @nitkkr.ac.in email address");
      return;
    }

    // Prevent if still in cooldown
    if (resetCooldown > 0) {
      return;
    }

    setEmailLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setEmailMessage(result.message);
        // Extract cooldown from response if needed, otherwise set default 30s
        setResetCooldown(30);
        // Don't move to next step, show resend option
      } else {
        // Check if error includes cooldown wait time
        if (result.error?.includes("Please wait")) {
          setEmailMessage(result.error);
          // Extract wait time from error message (e.g., "Please wait 25 seconds")
          const match = result.error.match(/(\d+)\s+second/);
          if (match) {
            const waitSeconds = parseInt(match[1]);
            setResetCooldown(waitSeconds);
          }
        } else {
          setEmailError(result.error);
        }
      }
    } catch (err) {
      setEmailError("Failed to request password reset. Try again.");
      console.error("Forgot password error:", err);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleResendReset = async (e) => {
    e.preventDefault();
    setEmailError("");
    setEmailMessage("");

    if (resetCooldown > 0) {
      return;
    }

    setEmailLoading(true);

    try {
      const result = await resendResetLink(email);

      if (result.success) {
        setEmailMessage(result.message);
        setResetCooldown(30);
      } else {
        // Check if error includes cooldown wait time
        if (result.error?.includes("Please wait")) {
          setEmailMessage(result.error);
          // Extract wait time from error message
          const match = result.error.match(/(\d+)\s+second/);
          if (match) {
            const waitSeconds = parseInt(match[1]);
            setResetCooldown(waitSeconds);
          }
        } else {
          setEmailError(result.error);
        }
      }
    } catch (err) {
      setEmailError("Failed to resend reset link. Try again.");
      console.error("Resend reset link error:", err);
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    // Validate inputs
    if (!newPassword.trim()) {
      setPasswordError("New password is required");
      return;
    }

    if (!confirmPassword.trim()) {
      setPasswordError("Please confirm your password");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordLoading(true);

    try {
      const result = await resetPassword(
        tokenFromUrl,
        newPassword,
        confirmPassword
      );

      if (result.success) {
        setPasswordMessage(result.message);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setPasswordError(result.error);
      }
    } catch (err) {
      setPasswordError("Failed to reset password. Try again.");
      console.error("Reset password error:", err);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Step 1: Email Request
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] px-4 py-12">
        <div
          className="w-full max-w-md space-y-6 bg-[#111111] p-6 rounded-xl border"
          style={{ borderColor: "#1f1f1f" }}
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Reset Password
            </h2>
            <p className="mt-1 text-sm text-[#555]">
              Enter your email to receive a reset link
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#aaa] mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@nitkkr.ac.in"
                className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a1a] border text-white placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-[#a855f7] transition"
                style={{ borderColor: "#2a2a2a" }}
                disabled={emailLoading || resetCooldown > 0}
              />
            </div>

            {emailError && (
              <div
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  background: "#ef444415",
                  color: "#ef4444",
                  border: "1px solid #ef444430",
                }}
              >
                {emailError}
              </div>
            )}

            {emailMessage && (
              <div
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  background: emailMessage.includes("successfully")
                    ? "#10b98115"
                    : "#fbbf2415",
                  color: emailMessage.includes("successfully")
                    ? "#10b981"
                    : "#fbbf24",
                  border: "1px solid",
                  borderColor: emailMessage.includes("successfully")
                    ? "#10b98130"
                    : "#fbbf2420",
                }}
              >
                {emailMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={emailLoading || resetCooldown > 0}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background:
                  emailLoading || resetCooldown > 0 ? "#a855f740" : "#a855f7",
                color: "white",
                border: "none",
                opacity: emailLoading || resetCooldown > 0 ? 0.6 : 1,
                cursor:
                  emailLoading || resetCooldown > 0 ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!emailLoading && resetCooldown <= 0)
                  e.target.style.background = "#9333ea";
              }}
              onMouseLeave={(e) => {
                if (!emailLoading && resetCooldown <= 0)
                  e.target.style.background = "#a855f7";
              }}
            >
              {emailLoading
                ? "Sending..."
                : resetCooldown > 0
                ? `Wait ${resetCooldown}s`
                : "Send Reset Link"}
            </button>
          </form>

          <div
            className="flex items-center justify-between pt-4 border-t"
            style={{ borderColor: "#1f1f1f" }}
          >
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-[#a855f7] hover:text-[#9333ea] transition"
            >
              Back to Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="text-sm text-[#555] hover:text-[#aaa] transition"
            >
              Don't have account?
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Token Invalid - Show Error
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] px-4 py-12">
        <div
          className="w-full max-w-md space-y-6 bg-[#111111] p-6 rounded-xl border"
          style={{ borderColor: "#1f1f1f" }}
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Reset Link Expired
            </h2>
            <p className="mt-1 text-sm text-[#555]">
              Your password reset link is no longer valid
            </p>
          </div>

          <div
            className="px-4 py-3 rounded-lg text-sm"
            style={{
              background: "#ef444415",
              color: "#ef4444",
              border: "1px solid #ef444430",
            }}
          >
            {passwordError || "The reset link has expired or been used."}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setStep(1);
                setEmail("");
                setPasswordError("");
              }}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: "#a855f7",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#9333ea";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#a855f7";
              }}
            >
              Request New Reset Link
            </button>
          </div>

          <div
            className="text-center pt-4 border-t"
            style={{ borderColor: "#1f1f1f" }}
          >
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-[#a855f7] hover:text-[#9333ea] transition"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: New Password Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] px-4 py-12">
      <div
        className="w-full max-w-md space-y-6 bg-[#111111] p-6 rounded-xl border"
        style={{ borderColor: "#1f1f1f" }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Create New Password
          </h2>
          <p className="mt-1 text-sm text-[#555]">Enter your new password</p>
        </div>

        {!tokenValid && verifyingToken && (
          <div className="text-center text-[#aaa]">Verifying token...</div>
        )}

        {!tokenValid && !verifyingToken && passwordError && (
          <div
            className="px-4 py-3 rounded-lg text-sm"
            style={{
              background: "#ef444415",
              color: "#ef4444",
              border: "1px solid #ef444430",
            }}
          >
            {passwordError}
          </div>
        )}

        {tokenValid && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-[#aaa] mb-2"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a1a] border text-white placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-[#a855f7] transition"
                style={{ borderColor: "#2a2a2a" }}
                disabled={passwordLoading}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[#aaa] mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a1a] border text-white placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-[#a855f7] transition"
                style={{ borderColor: "#2a2a2a" }}
                disabled={passwordLoading}
              />
            </div>

            {passwordError && (
              <div
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  background: "#ef444415",
                  color: "#ef4444",
                  border: "1px solid #ef444430",
                }}
              >
                {passwordError}
              </div>
            )}

            {passwordMessage && (
              <div
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  background: "#10b98115",
                  color: "#10b981",
                  border: "1px solid #10b98130",
                }}
              >
                {passwordMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: passwordLoading ? "#a855f740" : "#a855f7",
                color: "white",
                border: "none",
                opacity: passwordLoading ? 0.6 : 1,
                cursor: passwordLoading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!passwordLoading) e.target.style.background = "#9333ea";
              }}
              onMouseLeave={(e) => {
                if (!passwordLoading) e.target.style.background = "#a855f7";
              }}
            >
              {passwordLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div
          className="text-center pt-4 border-t"
          style={{ borderColor: "#1f1f1f" }}
        >
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-[#a855f7] hover:text-[#9333ea] transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
