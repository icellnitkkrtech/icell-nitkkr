// Admin Controller
import { getDB } from "../config/mongodb.js";
import * as authModel from "../models/authModel.js";
import {
  triggerManualCleanup,
  getCleanupStats,
} from "../utils/cleanupService.js";

/**
 * Get admin statistics
 * Returns statistics for all users and content
 */
export async function getStats(req, res) {
  try {
    const db = getDB();

    // Using Promise.all runs all these database queries at the same time
    // This makes the dashboard load instantly!
    const [
      totalUsers,
      totalStudents,
      totalMembers,
      totalPostHolders,
      unverifiedUsers,
      totalBlogs,
      totalEvents,
      totalPhotos,
      totalNewsletters,
    ] = await Promise.all([
      // Total Users = any user with role student, member, or post holder
      db.collection("profiles").countDocuments({
        $or: [
          { role: { $in: ["student", "member", "post_holder"] } },
          { post_position: { $ne: null, $exists: true } },
        ],
      }),
      // Total Students = role="student"
      db.collection("profiles").countDocuments({ role: "student" }),
      // Total Members = role="member"
      db.collection("profiles").countDocuments({ role: "member" }),
      // Total Post Holders = users with role "post_holder" or post_position set
      db.collection("profiles").countDocuments({
        $or: [
          { role: "post_holder" },
          { post_position: { $ne: null, $exists: true } },
        ],
      }),
      // Unverified Users = email_verified=false (any role)
      db.collection("profiles").countDocuments({ email_verified: false }),
      // Content counts
      db.collection("blogs").countDocuments({}),
      db.collection("events").countDocuments({}),
      db.collection("gallery").countDocuments({}),
      db.collection("newsletters").countDocuments({}),
    ]);

    // Send back the EXACT keys your AdminDashboard.jsx is expecting
    res.json({
      // User Statistics
      totalUsers: totalUsers || 0,
      totalStudents: totalStudents || 0,
      totalMembers: totalMembers || 0,
      totalPostHolders: totalPostHolders || 0,
      unverifiedUsers: unverifiedUsers || 0,
      // Content Statistics
      totalBlogs: totalBlogs || 0,
      totalEvents: totalEvents || 0,
      totalPhotos: totalPhotos || 0,
      totalNewsletters: totalNewsletters || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Failed to get statistics" });
  }
}

/**
 * Get all members (admin view)
 */
export async function getAllMembers(req, res) {
  try {
    const db = getDB();
    const profiles = db.collection("profiles");

    const members = await profiles
      .find({ is_member: true })
      .collation({ locale: "en", strength: 2 })
      .sort({ name: 1 })
      .toArray();

    res.json(members);
  } catch (error) {
    console.error("Get members error:", error);
    res.status(500).json({ error: "Failed to get members" });
  }
}

/**
 * Promote/demote member
 */
export async function promoteMember(req, res) {
  try {
    const { memberId, newRole } = req.body;

    if (!memberId || !newRole) {
      return res.status(400).json({ error: "Member ID and role are required" });
    }

    const validRoles = ["member", "post_holder", "admin"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const db = getDB();
    const profiles = db.collection("profiles");

    const result = await profiles.updateOne(
      { _id: memberId },
      {
        $set: {
          role: newRole,
          updated_at: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json({
      message: "Member role updated successfully",
      memberId,
      newRole,
    });
  } catch (error) {
    console.error("Promote member error:", error);
    res.status(500).json({ error: "Failed to update member role" });
  }
}

/**
 * Get all verified students for student management
 */
export async function getVerifiedStudents(req, res) {
  try {
    const { branch, year } = req.query;

    let students;

    if (branch && year) {
      students = await authModel.getStudentsByFilter(branch, year);
    } else if (branch) {
      students = await authModel.getStudentsByFilter(branch, null);
    } else if (year) {
      students = await authModel.getStudentsByFilter(null, year);
    } else {
      students = await authModel.getAllStudents();
    }

    res.json(students);
  } catch (error) {
    console.error("Get verified students error:", error);
    res.status(500).json({ error: "Failed to get verified students" });
  }
}

/**
 * Get all students (including unverified) - admin only
 */
export async function getAllStudentsAdmin(req, res) {
  try {
    const students = await authModel.getAllStudentsAdmin();

    // Calculate stats
    const verified = students.filter((s) => s.email_verified).length;
    const unverified = students.filter((s) => !s.email_verified).length;

    res.json({
      students,
      stats: {
        total: students.length,
        verified,
        unverified,
      },
    });
  } catch (error) {
    console.error("Get all students admin error:", error);
    res.status(500).json({ error: "Failed to get students" });
  }
}

/**
 * Promote student to member or post_holder
 */
export async function promoteStudent(req, res) {
  try {
    const { studentId, newRole, postPosition } = req.body;

    if (!studentId || !newRole) {
      return res
        .status(400)
        .json({ error: "Student ID and role are required" });
    }

    // Allow changing to any role
    const validRoles = ["member", "post_holder", "student", "admin"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({
        error:
          "Invalid role. Must be 'member', 'post_holder', 'student', or 'admin'",
      });
    }

    // Check if student exists
    const student = await authModel.getUserById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Only allow promotion from student
    if (
      student.role !== "student" &&
      newRole !== "student" &&
      newRole !== "admin"
    ) {
      return res.status(400).json({
        error:
          "Cannot change role of non-student users. Use change-role endpoint instead.",
      });
    }

    // Email verification required for member/post_holder
    if (
      (newRole === "member" || newRole === "post_holder") &&
      !student.email_verified
    ) {
      return res.status(403).json({
        error:
          "Cannot promote unverified student. Student must verify email first.",
      });
    }

    // Promote the student with optional position
    const success = await authModel.promoteStudent(
      studentId,
      newRole,
      postPosition
    );

    if (!success) {
      return res.status(500).json({ error: "Failed to promote student" });
    }

    const roleDescription =
      newRole === "member"
        ? "Member"
        : newRole === "post_holder"
        ? "Post Holder"
        : newRole === "admin"
        ? "Admin"
        : "Student";

    res.json({
      message: `User role changed to ${roleDescription} successfully`,
      studentId,
      newRole,
      postPosition: postPosition || null,
    });
  } catch (error) {
    console.error("Promote student error:", error);
    res.status(500).json({ error: "Failed to promote student" });
  }
}

/**
 * Demote user back to student
 */
export async function demoteToStudent(req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Check if user exists
    const user = await authModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ error: "Cannot demote an admin user" });
    }

    // Demote to student
    const success = await authModel.promoteStudent(userId, "student");

    if (!success) {
      return res.status(500).json({ error: "Failed to demote user" });
    }

    res.json({
      message: "User demoted to student successfully",
      userId,
      newRole: "student",
    });
  } catch (error) {
    console.error("Demote user error:", error);
    res.status(500).json({ error: "Failed to demote user" });
  }
}

/**
 * Delete unverified student account
 */
export async function deleteUnverifiedStudent(req, res) {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    // Check if student exists
    const student = await authModel.getUserById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (student.email_verified) {
      return res.status(400).json({
        error:
          "Cannot delete verified student. Only unverified accounts can be manually deleted.",
      });
    }

    // Delete the student
    const success = await authModel.deleteStudentProfile(studentId);

    if (!success) {
      return res.status(500).json({ error: "Failed to delete student" });
    }

    res.json({
      message: "Unverified student account deleted successfully",
      studentId,
    });
  } catch (error) {
    console.error("Delete unverified student error:", error);
    res.status(500).json({ error: "Failed to delete student" });
  }
}

/**
 * Change role between member and post_holder for already-promoted users
 */
export async function changePromotedUserRole(req, res) {
  try {
    const { userId, newRole, postPosition } = req.body;

    if (!userId || !newRole) {
      return res.status(400).json({ error: "User ID and role are required" });
    }

    // Allow changing to any role
    const validRoles = ["member", "post_holder", "student", "admin"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({
        error:
          "Invalid role. Must be 'member', 'post_holder', 'student', or 'admin'",
      });
    }

    // Check if user exists
    const user = await authModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent changing admin role
    if (user.role === "admin" || newRole === "admin") {
      return res.status(403).json({
        error: "Cannot change admin role",
      });
    }

    // Update the role with optional position
    const success = await authModel.promoteStudent(
      userId,
      newRole,
      postPosition
    );

    if (!success) {
      return res.status(500).json({ error: "Failed to change user role" });
    }

    const roleDescription =
      newRole === "member"
        ? "Member"
        : newRole === "post_holder"
        ? "Post Holder"
        : "Student";

    res.json({
      message: `User role changed to ${roleDescription} successfully`,
      userId,
      newRole,
      postPosition: postPosition || null,
    });
  } catch (error) {
    console.error("Change promoted user role error:", error);
    res.status(500).json({ error: "Failed to change user role" });
  }
}

/**
 * Get cleanup job statistics
 */
export async function getCleanupJobStats(req, res) {
  try {
    const stats = await getCleanupStats();

    res.json({
      stats,
      message: "Cleanup job statistics retrieved",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get cleanup stats error:", error);
    res.status(500).json({ error: "Failed to get cleanup statistics" });
  }
}

/**
 * Manually trigger cleanup of unverified accounts
 */
export async function triggerUnverifiedCleanup(req, res) {
  try {
    const deletedCount = await triggerManualCleanup();

    res.json({
      message:
        "Manual cleanup executed successfully. Deleted unverified student accounts older than 2 days.",
      deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Trigger cleanup error:", error);
    res.status(500).json({ error: "Failed to trigger cleanup" });
  }
}
