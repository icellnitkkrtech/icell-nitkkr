import { getDB } from "../config/mongodb.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// Create new user
export async function createUser(email, password, name, phone, branch, year) {
  const db = getDB();
  const profiles = db.collection("profiles");

  // Check if user already exists
  const existingUser = await profiles.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userId = uuidv4();
  const user = {
    _id: userId,
    email,
    password: hashedPassword,
    name: name || "",
    phone: phone || "",
    branch: branch || "",
    year: year || "",
    roll_number: "",
    role: "student",
    is_member: false,
    post_position: null,
    email_verified: false,
    verification_token_hash: null,
    verification_token_expires_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  await profiles.insertOne(user);
  return { _id: userId, id: userId, email, name };
}

// Get user by email
export async function getUserByEmail(email) {
  const db = getDB();
  const profiles = db.collection("profiles");
  return await profiles.findOne({ email });
}

// Get user by ID
export async function getUserById(id) {
  const db = getDB();
  const profiles = db.collection("profiles");
  return await profiles.findOne({ _id: id });
}

// Verify password
export async function verifyPassword(inputPassword, hashedPassword) {
  return await bcrypt.compare(inputPassword, hashedPassword);
}

// Update user role
export async function updateUserRole(userId, role) {
  const db = getDB();
  const profiles = db.collection("profiles");

  const result = await profiles.updateOne(
    { _id: userId },
    {
      $set: {
        role,
        updated_at: new Date(),
      },
    }
  );

  return result.modifiedCount > 0;
}

// Update user profile
export async function updateUserProfile(userId, updates) {
  const db = getDB();
  const profiles = db.collection("profiles");

  const result = await profiles.updateOne(
    { _id: userId },
    {
      $set: {
        ...updates,
        updated_at: new Date(),
      },
    }
  );

  return result.modifiedCount > 0;
}

// Get all verified students (with email verification)
export async function getAllStudents() {
  const db = getDB();
  const profiles = db.collection("profiles");

  return await profiles
    .find({ role: { $in: ["student", "member"] }, email_verified: true })
    .sort({ created_at: -1 })
    .toArray();
}

// Get all students (verified or not) - for admin to see all students
export async function getAllStudentsAdmin() {
  const db = getDB();
  const profiles = db.collection("profiles");

  // Return all verified users from student cohort (student, member, post_holder roles)
  return await profiles
    .find({
      role: { $in: ["student", "member", "post_holder"] },
      email_verified: true,
    })
    .sort({ created_at: -1 })
    .toArray();
}

// Get verified students by filter
export async function getStudentsByFilter(branch, year) {
  const db = getDB();
  const profiles = db.collection("profiles");

  const filter = { role: { $in: ["student", "member"] }, email_verified: true };
  if (branch) filter.branch = branch;
  if (year) filter.year = year;

  return await profiles.find(filter).sort({ created_at: -1 }).toArray();
}

// Get unverified students (for cleanup)
export async function getUnverifiedStudents() {
  const db = getDB();
  const profiles = db.collection("profiles");

  return await profiles
    .find({ role: "student", email_verified: false })
    .sort({ created_at: 1 })
    .toArray();
}

// Promote student to member or post_holder
export async function promoteStudent(studentId, newRole, postPosition = null) {
  const db = getDB();
  const profiles = db.collection("profiles");

  const validRoles = ["student", "member", "post_holder", "admin"];
  if (!validRoles.includes(newRole)) {
    throw new Error(`Invalid role: ${newRole}`);
  }

  const updateData = {
    role: newRole,
    updated_at: new Date(),
  };

  // When promoting to member or post_holder, mark as member
  if (newRole === "member" || newRole === "post_holder") {
    updateData.is_member = true;
  } else {
    // When demoting to student or admin, clear position
    updateData.is_member = false;
    updateData.post_position = null;
  }

  // Store position if promoting to post_holder with a position
  if (newRole === "post_holder" && postPosition) {
    updateData.post_position = postPosition;
  } else if (newRole === "member") {
    updateData.post_position = null;
  }

  const result = await profiles.updateOne(
    { _id: studentId },
    {
      $set: updateData,
    }
  );

  return result.modifiedCount > 0;
}

// Delete unverified accounts older than specified hours
export async function deleteUnverifiedOlderThan(hoursAgo) {
  const db = getDB();
  const profiles = db.collection("profiles");

  const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

  const result = await profiles.deleteMany({
    role: "student",
    email_verified: false,
    created_at: { $lt: cutoffTime },
  });

  return result.deletedCount;
}

// Check if any admin exists
export async function checkAdminExists() {
  const db = getDB();
  const profiles = db.collection("profiles");

  const admin = await profiles.findOne({ role: "admin" });
  return admin !== null;
}

// Create admin user
export async function createAdmin(email, password, name = "Admin") {
  const db = getDB();
  const profiles = db.collection("profiles");

  // Check if user already exists
  const existingUser = await profiles.findOne({ email });
  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const adminId = uuidv4();
  const admin = {
    _id: adminId,
    email,
    password: hashedPassword,
    name: name || "Admin",
    phone: "",
    branch: "",
    year: "",
    roll_number: "",
    role: "admin",
    is_member: false,
    email_verified: true,
    verification_token_hash: null,
    verification_token_expires_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  await profiles.insertOne(admin);
  return { id: adminId, email, name };
}
// Delete a student
export async function deleteStudentProfile(studentId) {
  const db = getDB();
  const profiles = db.collection("profiles");

  // Prevent deleting an admin
  const user = await profiles.findOne({ _id: studentId });
  if (user && user.role === "admin") {
    throw new Error("Cannot delete an admin account.");
  }

  const result = await profiles.deleteOne({ _id: studentId });
  return result.deletedCount > 0;
}

export async function saveEmailVerificationToken(userId, tokenHash, expiresAt) {
  const db = getDB();
  const profiles = db.collection("profiles");

  const generatedAt = new Date(); // Explicit timestamp of token generation
  const result = await profiles.updateOne(
    { _id: userId },
    {
      $set: {
        verification_token_hash: tokenHash,
        verification_token_expires_at: expiresAt,
        verification_token_generated_at: generatedAt, // NEW: explicit generation time
        updated_at: new Date(),
      },
    }
  );

  return result.modifiedCount > 0;
}

// Get email verification token info (returns generated timestamp)
export async function getEmailVerificationTokenInfo(userId) {
  const db = getDB();
  const profiles = db.collection("profiles");

  const user = await profiles.findOne(
    { _id: userId },
    {
      projection: {
        verification_token_expires_at: 1,
        verification_token_generated_at: 1, // NEW
      },
    }
  );

  return {
    expiresAt: user?.verification_token_expires_at || null,
    generatedAt: user?.verification_token_generated_at || null, // NEW
  };
}

export async function verifyEmailByTokenHash(tokenHash) {
  const db = getDB();
  const profiles = db.collection("profiles");

  const now = new Date();
  const result = await profiles.updateOne(
    {
      verification_token_hash: tokenHash,
      verification_token_expires_at: { $gt: now },
      email_verified: { $ne: true },
    },
    {
      $set: {
        email_verified: true,
        updated_at: now,
      },
      $unset: {
        verification_token_hash: "",
        verification_token_expires_at: "",
      },
    }
  );

  return result.modifiedCount > 0;
}

// Save password reset token
export async function savePasswordResetToken(userId, tokenHash, expiresAt) {
  const db = getDB();
  const profiles = db.collection("profiles");

  const generatedAt = new Date(); // Explicit timestamp of token generation
  const result = await profiles.updateOne(
    { _id: userId },
    {
      $set: {
        password_reset_token_hash: tokenHash,
        password_reset_token_expires_at: expiresAt,
        password_reset_token_generated_at: generatedAt, // NEW: explicit generation time
        updated_at: new Date(),
      },
    }
  );

  return result.modifiedCount > 0;
}

// Get user by password reset token hash
export async function getUserByResetTokenHash(tokenHash) {
  const db = getDB();
  const profiles = db.collection("profiles");

  const now = new Date();
  return await profiles.findOne({
    password_reset_token_hash: tokenHash,
    password_reset_token_expires_at: { $gt: now },
  });
}

// Get password reset token info (for cooldown check)
export async function getPasswordResetTokenInfo(userId) {
  const db = getDB();
  const profiles = db.collection("profiles");

  const user = await profiles.findOne(
    { _id: userId },
    {
      projection: {
        password_reset_token_expires_at: 1,
        password_reset_token_generated_at: 1, // NEW
      },
    }
  );

  return {
    expiresAt: user?.password_reset_token_expires_at || null,
    generatedAt: user?.password_reset_token_generated_at || null, // NEW
  };
}

// Reset user password and clear reset token
export async function resetUserPassword(userId, hashedPassword) {
  const db = getDB();
  const profiles = db.collection("profiles");

  const result = await profiles.updateOne(
    { _id: userId },
    {
      $set: {
        password: hashedPassword,
        updated_at: new Date(),
      },
      $unset: {
        password_reset_token_hash: "",
        password_reset_token_expires_at: "",
      },
    }
  );

  return result.modifiedCount > 0;
}

// Clear password reset token (for expired tokens or cleanup)
export async function clearPasswordResetToken(userId) {
  const db = getDB();
  const profiles = db.collection("profiles");

  const result = await profiles.updateOne(
    { _id: userId },
    {
      $unset: {
        password_reset_token_hash: "",
        password_reset_token_expires_at: "",
      },
      $set: {
        updated_at: new Date(),
      },
    }
  );

  return result.modifiedCount > 0;
}

// Delete all expired password reset tokens
export async function deleteExpiredPasswordResetTokens() {
  const db = getDB();
  const profiles = db.collection("profiles");

  const now = new Date();
  const result = await profiles.updateMany(
    {
      password_reset_token_expires_at: { $lt: now, $ne: null },
    },
    {
      $unset: {
        password_reset_token_hash: "",
        password_reset_token_expires_at: "",
      },
      $set: {
        updated_at: now,
      },
    }
  );

  return result.modifiedCount;
}
