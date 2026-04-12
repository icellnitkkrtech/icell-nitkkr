import * as authModel from "../models/authModel.js";
import * as certificateModel from "../models/certificateModel.js";
import { fetchStudentEventAttendance } from "../models/eventAttendanceModel.js";
import crypto from "crypto";
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/emailService.js";

const NITKKR_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@nitkkr\.ac\.in$/i;
const EMAIL_VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const EMAIL_SEND_TIMEOUT_MS = Number(
  process.env.EMAIL_SEND_TIMEOUT_MS || 30000
); // Increased from 15s to 30s
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds cooldown between resends
const PASSWORD_RESET_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_COOLDOWN_MS = 30 * 1000; // 30 seconds cooldown between reset requests

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Email service timeout"));
      }, timeoutMs);
    }),
  ]);
}

function getBackendPublicUrl() {
  return (
    process.env.BACKEND_PUBLIC_URL ||
    `http://localhost:${process.env.PORT || 5000}`
  );
}

function getFrontendUrl() {
  return process.env.FRONTEND_URL || "http://localhost:5173";
}

// Register
export async function register(req, res) {
  try {
    const { email, password, name, phone, branch, year } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: "Email, password, and name are required" });
    }

    if (!NITKKR_EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        error: "Only @nitkkr.ac.in email addresses are allowed",
      });
    }

    const user = await authModel.createUser(
      email,
      password,
      name,
      phone,
      branch,
      year
    );

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    const verificationTokenExpiry = new Date(
      Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY_MS
    );

    await authModel.saveEmailVerificationToken(
      user._id,
      verificationTokenHash,
      verificationTokenExpiry
    );

    const verificationLink = `${getBackendPublicUrl()}/api/auth/verify-email?token=${verificationToken}`;
    await withTimeout(
      sendVerificationEmail(user.email, user.name, verificationLink),
      EMAIL_SEND_TIMEOUT_MS
    );

    res.status(201).json({
      message:
        "Registration successful. Please verify your email from the link sent to your inbox.",
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.message === "Email service timeout") {
      return res.status(503).json({
        error:
          "Email server is taking too long. Please try registration again in a moment.",
      });
    }
    res.status(400).json({ error: error.message });
  }
}

// Login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await authModel.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await authModel.verifyPassword(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.email_verified) {
      return res.status(403).json({
        error: "Please verify your email before logging in",
      });
    }

    const accessToken = generateToken(user._id, user.email, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { token } = req.query;
    const frontendUrl = getFrontendUrl();

    if (!token) {
      return res.redirect(`${frontendUrl}/login?verified=0`);
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const updatedUser = await authModel.verifyEmailByTokenHash(tokenHash);

    if (!updatedUser) {
      return res.redirect(`${frontendUrl}/login?verified=0`);
    }

    return res.redirect(`${frontendUrl}/login?verified=1`);
  } catch (error) {
    console.error("Verify email error:", error);
    return res.redirect(`${getFrontendUrl()}/login?verified=0`);
  }
}

// Resend verification email
export async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!NITKKR_EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        error: "Only @nitkkr.ac.in email addresses are allowed",
      });
    }

    // Check if user exists
    const user = await authModel.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        error: "No account found with this email. Please register first.",
      });
    }

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({
        error: "Email is already verified. You can log in now.",
      });
    }

    // Check resend cooldown based on token generation time (30 seconds)
    if (user.verification_token_expires_at) {
      const now = new Date();
      let timeSinceGeneration;

      // NEW: Use explicit generation timestamp if available (backward compatible)
      if (user.verification_token_generated_at) {
        const generatedAt = new Date(user.verification_token_generated_at);
        timeSinceGeneration = now.getTime() - generatedAt.getTime();
      } else {
        // FALLBACK: Use old calculation for tokens without timestamp field
        const tokenExpiry = new Date(user.verification_token_expires_at);
        const timeUntilExpiry = tokenExpiry.getTime() - now.getTime();
        timeSinceGeneration =
          EMAIL_VERIFICATION_TOKEN_EXPIRY_MS - timeUntilExpiry;
      }

      // If token was generated less than 30 seconds ago, prevent resend
      if (timeSinceGeneration < RESEND_COOLDOWN_MS) {
        const remainingMs = RESEND_COOLDOWN_MS - timeSinceGeneration;
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        const pluralS = remainingSeconds !== 1 ? "s" : "";

        return res.status(429).json({
          error: `Please wait ${remainingSeconds} second${pluralS} before requesting another verification email.`,
        });
      }
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    const verificationTokenExpiry = new Date(
      Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY_MS
    );

    // Update token in database
    await authModel.saveEmailVerificationToken(
      user._id,
      verificationTokenHash,
      verificationTokenExpiry
    );

    // Send verification email
    const verificationLink = `${getBackendPublicUrl()}/api/auth/verify-email?token=${verificationToken}`;
    await withTimeout(
      sendVerificationEmail(user.email, user.name, verificationLink),
      EMAIL_SEND_TIMEOUT_MS
    );

    res.json({
      message: "Verification email sent successfully. Check your inbox.",
      expiresIn: "24 hours",
    });
  } catch (error) {
    console.error("Resend verification email error:", error);
    if (error.message === "Email service timeout") {
      return res.status(503).json({
        error: "Email server is taking too long. Please try again in a moment.",
      });
    }
    res.status(500).json({ error: "Failed to resend verification email" });
  }
}

// Refresh token
export async function refreshToken(req, res) {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const payload = verifyRefreshToken(refresh_token);

    if (!payload) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const user = await authModel.getUserById(payload.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const newAccessToken = generateToken(user._id, user.email, user.role);

    res.json({
      access_token: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ error: "Token refresh failed" });
  }
}

// Get user profile
export async function getProfile(req, res) {
  try {
    const userId = req.user.userId;
    const user = await authModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      branch: user.branch,
      year: user.year,
      role: user.role,
      is_member: user.is_member,
      email_verified: user.email_verified === true,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
}

// Update user profile
export async function updateProfile(req, res) {
  try {
    const userId = req.user.userId;
    const { name, phone, branch, year, roll_number } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (branch) updates.branch = branch;
    if (year) updates.year = year;
    if (roll_number) updates.roll_number = roll_number;

    await authModel.updateUserProfile(userId, updates);

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
}

// Get all students
export async function getAllStudents(req, res) {
  try {
    const students = await authModel.getAllStudents();
    res.json(students);
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ error: "Failed to get students" });
  }
}

// Get students by filter
export async function getStudentsByFilter(req, res) {
  try {
    const { branch, year } = req.query;
    const students = await authModel.getStudentsByFilter(branch, year);
    res.json(students);
  } catch (error) {
    console.error("Filter students error:", error);
    res.status(500).json({ error: "Failed to filter students" });
  }
}

// Promote student
export async function promoteStudent(req, res) {
  try {
    const { studentId, newRole, postPosition } = req.body;

    if (!studentId || !newRole) {
      return res
        .status(400)
        .json({ error: "Student ID and role are required" });
    }

    // If promoting to member role, require post position
    if (newRole === "member" && postPosition) {
      // Verify post position is not empty
      if (!postPosition.trim()) {
        return res.status(400).json({ error: "Post position cannot be empty" });
      }
    }

    // Promote the student
    await authModel.promoteStudent(studentId, newRole, postPosition);

    // Get the student after promotion
    const student = await authModel.getUserById(studentId);

    // Auto-generate corresponding certificate
    try {
      if (newRole === "member") {
        // Check if member certificate already exists
        const existingCert = await certificateModel.hasCertificateType(
          studentId,
          "member"
        );

        if (!existingCert) {
          await certificateModel.createCertificate(studentId, "member", {
            title: "iCell Member Certificate",
            description: "Official membership certificate",
          });
        }

        // If post position provided, also create post holder certificate
        if (postPosition) {
          const existingPostCert = await certificateModel.hasCertificateType(
            studentId,
            "post_holder"
          );

          if (!existingPostCert) {
            await certificateModel.createCertificate(studentId, "post_holder", {
              title: `${postPosition} - Post Holder Certificate`,
              description: `Appointed as ${postPosition}`,
              post_position: postPosition,
            });
          }
        }
      }
    } catch (certError) {
      console.warn(
        "Warning: Could not create certificate for promoted user:",
        certError
      );
      // Don't fail the promotion if certificate creation fails
    }

    res.json({
      message: "Student promoted successfully",
      certificateGenerated: newRole === "member",
    });
  } catch (error) {
    console.error("Promote student error:", error);
    res.status(500).json({ error: "Failed to promote student" });
  }
}

// Get user attendance
export async function getAttendance(req, res) {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User ID not found in token" });
    }

    // Fetch attendance records from event_attendance collection
    const { data, error } = await fetchStudentEventAttendance(userId);

    if (error) {
      console.error("Error fetching attendance:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch attendance records" });
    }

    // Return array of attendance records
    // Frontend expects: [{ status: "present", event_name: "...", event_date: "..." }, ...]
    res.json(data || []);
  } catch (error) {
    console.error("Get attendance error:", error);
    res.status(500).json({ error: "Failed to get attendance" });
  }
}

// Admin setup - only works if no admin exists
export async function setupAdmin(req, res) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if admin already exists
    const adminExists = await authModel.checkAdminExists();
    if (adminExists) {
      return res.status(400).json({
        error: "Admin already exists. Contact existing admin for changes.",
      });
    }

    // Create admin
    const admin = await authModel.createAdmin(email, password, name || "Admin");

    const accessToken = generateToken(admin.id, admin.email, "admin");
    const refreshToken = generateRefreshToken(admin.id);

    res.status(201).json({
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: "admin",
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      message: "Admin created successfully",
    });
  } catch (error) {
    console.error("Admin setup error:", error);
    res.status(500).json({ error: error.message || "Failed to setup admin" });
  }
}
// Add a new student manually (Admin only)
export async function addStudent(req, res) {
  try {
    const { name, email, password, branch, year, roll_number } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    // Reuse your existing createUser function from the model
    // Note: createUser doesn't take roll_number yet, so we will update the profile right after creation
    const newUser = await authModel.createUser(
      email,
      password,
      name,
      "", // phone
      branch,
      year
    );

    // If a roll number was provided, update the newly created profile
    if (roll_number) {
      await authModel.updateUserProfile(newUser.id, { roll_number });
    }

    res
      .status(201)
      .json({ message: "Student added successfully", student: newUser });
  } catch (error) {
    console.error("Add student error:", error);
    // If it's the "User already exists" error from the model, send a 400
    if (error.message === "User already exists") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to add student" });
  }
}

// Delete a student (Admin only)
export async function deleteStudent(req, res) {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.user?.userId) {
      return res
        .status(400)
        .json({ error: "You cannot delete your own account." });
    }

    const deleted = await authModel.deleteStudentProfile(id);

    if (!deleted) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete student error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to delete student" });
  }
}

// Forgot password - request password reset
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!NITKKR_EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        error: "Only @nitkkr.ac.in email addresses are allowed",
      });
    }

    // Check if user exists
    const user = await authModel.getUserByEmail(email);
    if (!user) {
      // For security, don't reveal if email exists
      return res.json({
        message:
          "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Check reset cooldown based on token generation time (30 seconds)
    const tokenInfo = await authModel.getPasswordResetTokenInfo(user._id);
    if (tokenInfo) {
      const now = new Date();
      let timeSinceGeneration;

      // NEW: Use explicit generation timestamp if available (backward compatible)
      if (tokenInfo.generatedAt) {
        const generatedAt = new Date(tokenInfo.generatedAt);
        timeSinceGeneration = now.getTime() - generatedAt.getTime();
      } else {
        // FALLBACK: Use old calculation for tokens without timestamp field
        const tokenExpiry = new Date(tokenInfo.expiresAt);
        const timeUntilExpiry = tokenExpiry.getTime() - now.getTime();
        timeSinceGeneration = PASSWORD_RESET_TOKEN_EXPIRY_MS - timeUntilExpiry;
      }

      // If token was generated less than 30 seconds ago, prevent resend
      if (timeSinceGeneration < PASSWORD_RESET_COOLDOWN_MS) {
        const remainingMs = PASSWORD_RESET_COOLDOWN_MS - timeSinceGeneration;
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        const pluralS = remainingSeconds !== 1 ? "s" : "";

        return res.status(429).json({
          error: `Please wait ${remainingSeconds} second${pluralS} before requesting another password reset email.`,
        });
      }
    }

    // Generate new password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetTokenExpiry = new Date(
      Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MS
    );

    // Save token to database
    await authModel.savePasswordResetToken(
      user._id,
      resetTokenHash,
      resetTokenExpiry
    );

    // Send reset email
    const resetLink = `${getFrontendUrl()}/forgot-password?token=${resetToken}`;
    await withTimeout(
      sendPasswordResetEmail(user.email, user.name, resetLink),
      EMAIL_SEND_TIMEOUT_MS
    );

    res.json({
      message:
        "If an account exists with this email, you will receive a password reset link.",
      expiresIn: "24 hours",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    if (error.message === "Email service timeout") {
      return res.status(503).json({
        error: "Email server is taking too long. Please try again in a moment.",
      });
    }
    res.status(500).json({ error: "Failed to process password reset request" });
  }
}

// Verify reset token
export async function verifyResetToken(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        valid: false,
        message: "Reset token is required",
      });
    }

    // Hash the token to find in database
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with this reset token
    const user = await authModel.getUserByResetTokenHash(tokenHash);

    if (!user) {
      return res.status(400).json({
        valid: false,
        message:
          "Your reset link has expired or is invalid. Please request a new password reset.",
      });
    }

    // Token is valid
    res.json({
      valid: true,
      message: "Reset token is valid",
    });
  } catch (error) {
    console.error("Verify reset token error:", error);
    res.status(500).json({
      valid: false,
      message: "Failed to verify reset token",
    });
  }
}

// Reset password - submit new password
export async function resetPassword(req, res) {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!token) {
      return res.status(400).json({ error: "Reset token is required" });
    }

    if (!newPassword) {
      return res.status(400).json({ error: "New password is required" });
    }

    if (!confirmPassword) {
      return res
        .status(400)
        .json({ error: "Password confirmation is required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Validate password strength (same as registration)
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    // Hash the token to find in database
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with this reset token
    const user = await authModel.getUserByResetTokenHash(tokenHash);

    if (!user) {
      return res.status(400).json({
        error:
          "Your reset link has expired or is invalid. Please request a new password reset.",
      });
    }

    // Hash the new password
    const bcrypt = (await import("bcryptjs")).default;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    const updated = await authModel.resetUserPassword(user._id, hashedPassword);

    if (!updated) {
      return res.status(500).json({ error: "Failed to reset password" });
    }

    res.json({
      success: true,
      message:
        "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
}

// Resend password reset link
export async function resendResetLink(req, res) {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!NITKKR_EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        error: "Only @nitkkr.ac.in email addresses are allowed",
      });
    }

    // Check if user exists
    const user = await authModel.getUserByEmail(email);
    if (!user) {
      // For security, don't reveal if email exists
      return res.json({
        message:
          "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Check reset cooldown based on token generation time (30 seconds)
    const tokenInfo = await authModel.getPasswordResetTokenInfo(user._id);
    if (tokenInfo) {
      const now = new Date();
      let timeSinceGeneration;

      // NEW: Use explicit generation timestamp if available (backward compatible)
      if (tokenInfo.generatedAt) {
        const generatedAt = new Date(tokenInfo.generatedAt);
        timeSinceGeneration = now.getTime() - generatedAt.getTime();
      } else {
        // FALLBACK: Use old calculation for tokens without timestamp field
        const tokenExpiry = new Date(tokenInfo.expiresAt);
        const timeUntilExpiry = tokenExpiry.getTime() - now.getTime();
        timeSinceGeneration = PASSWORD_RESET_TOKEN_EXPIRY_MS - timeUntilExpiry;
      }

      // If token was generated less than 30 seconds ago, prevent resend
      if (timeSinceGeneration < PASSWORD_RESET_COOLDOWN_MS) {
        const remainingMs = PASSWORD_RESET_COOLDOWN_MS - timeSinceGeneration;
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        const pluralS = remainingSeconds !== 1 ? "s" : "";

        return res.status(429).json({
          error: `Please wait ${remainingSeconds} second${pluralS} before requesting another password reset email.`,
        });
      }
    }

    // Generate new password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetTokenExpiry = new Date(
      Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MS
    );

    // Update token in database
    await authModel.savePasswordResetToken(
      user._id,
      resetTokenHash,
      resetTokenExpiry
    );

    // Send reset email
    const resetLink = `${getFrontendUrl()}/forgot-password?token=${resetToken}`;
    await withTimeout(
      sendPasswordResetEmail(user.email, user.name, resetLink),
      EMAIL_SEND_TIMEOUT_MS
    );

    res.json({
      message:
        "Password reset link sent successfully. Check your inbox for the email.",
      expiresIn: "24 hours",
    });
  } catch (error) {
    console.error("Resend reset link error:", error);
    if (error.message === "Email service timeout") {
      return res.status(503).json({
        error: "Email server is taking too long. Please try again in a moment.",
      });
    }
    res.status(500).json({ error: "Failed to resend password reset email" });
  }
}
