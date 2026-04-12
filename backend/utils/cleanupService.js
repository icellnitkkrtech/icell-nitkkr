/**
 * Background cleanup service for handling expired unverified student accounts
 * Automatically deletes student accounts that haven't verified their email within 2 days
 */

import * as authModel from "../models/authModel.js";

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Run every hour (in ms)
const UNVERIFIED_EXPIRY_HOURS = 48; // Delete unverified accounts older than 48 hours (2 days)

let cleanupJobInterval = null;

/**
 * Start the background cleanup job
 * Runs periodically to delete unverified student accounts older than 2 days
 */
export function startCleanupJob() {
  // Run cleanup immediately on startup
  performCleanup();

  // Then schedule it to run periodically
  cleanupJobInterval = setInterval(() => {
    performCleanup();
  }, CLEANUP_INTERVAL_MS);

  console.log(
    "[Cleanup Service] Started background cleanup job - runs every hour"
  );
}

/**
 * Stop the background cleanup job
 */
export function stopCleanupJob() {
  if (cleanupJobInterval) {
    clearInterval(cleanupJobInterval);
    cleanupJobInterval = null;
    console.log("[Cleanup Service] Stopped background cleanup job");
  }
}

/**
 * Perform the actual cleanup
 */
export async function performCleanup() {
  try {
    console.log(
      `[Cleanup Service] Running cleanup job at ${new Date().toISOString()}`
    );

    // Delete unverified accounts
    const deletedUnverifiedCount = await authModel.deleteUnverifiedOlderThan(
      UNVERIFIED_EXPIRY_HOURS
    );

    if (deletedUnverifiedCount > 0) {
      console.log(
        `[Cleanup Service] Deleted ${deletedUnverifiedCount} unverified student account(s) older than ${UNVERIFIED_EXPIRY_HOURS} hours (2 days)`
      );
    } else {
      console.log(
        "[Cleanup Service] No unverified accounts to delete at this time"
      );
    }

    // Delete expired password reset tokens
    const deletedResetTokenCount =
      await authModel.deleteExpiredPasswordResetTokens();

    if (deletedResetTokenCount > 0) {
      console.log(
        `[Cleanup Service] Cleared ${deletedResetTokenCount} expired password reset token(s)`
      );
    }

    return deletedUnverifiedCount;
  } catch (error) {
    console.error("[Cleanup Service] Error during cleanup:", error);
    return 0;
  }
}

/**
 * Get cleanup statistics (for monitoring)
 */
export async function getCleanupStats() {
  try {
    const unverifiedStudents = await authModel.getUnverifiedStudents();

    const now = new Date();
    const cutoffTime = new Date(
      now.getTime() - UNVERIFIED_EXPIRY_HOURS * 60 * 60 * 1000
    );

    const stats = {
      totalUnverified: unverifiedStudents.length,
      expiredAndWillBeDeleted: unverifiedStudents.filter(
        (s) => s.created_at < cutoffTime
      ).length,
      recentUnverified: unverifiedStudents.filter(
        (s) => s.created_at >= cutoffTime
      ).length,
      expiryThresholdTime: cutoffTime.toISOString(),
      nextCleanupInterval: `Every ${CLEANUP_INTERVAL_MS / 1000 / 60} minutes`,
      unverifiedExpiryHours: UNVERIFIED_EXPIRY_HOURS,
    };

    return stats;
  } catch (error) {
    console.error("[Cleanup Service] Error getting cleanup stats:", error);
    throw error;
  }
}

/**
 * Manually trigger cleanup (can be called by admin endpoint)
 */
export async function triggerManualCleanup() {
  try {
    console.log("[Cleanup Service] Manual cleanup triggered by admin");
    return await performCleanup();
  } catch (error) {
    console.error("[Cleanup Service] Error during manual cleanup:", error);
    throw error;
  }
}
