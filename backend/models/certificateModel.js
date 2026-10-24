import { getDB } from "../config/mongodb.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Certificate Model - Unified template-based schema
 */

/**
 * Create a single certificate record
 * @param {Object} certData
 * @param {string} certData.userId - Recipient user ID (links to profile)
 * @param {string} certData.templateId - Template ID used to render
 * @param {string} certData.title - Certificate title / Event name
 * @param {string} certData.recipientEmail - Recipient email
 * @param {Object} certData.dynamicData - Key-value pairs for template fields
 * @param {string} [certData.batchId] - CSV batch ID
 * @param {string} [certData.issuedBy] - Admin user ID
 * @param {Date|string} [certData.issuedDate] - Issuance date
 */
export async function createCertificate({
  userId,
  templateId,
  title,
  recipientEmail,
  dynamicData = {},
  batchId = null,
  issuedBy = null,
  issuedDate = null,
}) {
  try {
    const db = getDB();
    const certificates = db.collection("certificates");

    const now = new Date();
    const parsedDate = issuedDate ? new Date(issuedDate) : now;
    const finalIssuedDate = isNaN(parsedDate.getTime()) ? now : parsedDate;

    const certificate = {
      _id: uuidv4(),
      user_id: userId,
      template_id: templateId,
      title: String(title || "Certificate").trim(),
      recipient_email: String(recipientEmail || "").trim().toLowerCase(),
      dynamic_data: dynamicData,
      batch_id: batchId,
      issued_by: issuedBy,
      issued_date: finalIssuedDate,
      is_downloaded: false,
      created_at: now,
      updated_at: now,
    };

    await certificates.insertOne(certificate);
    return certificate;
  } catch (error) {
    console.error("Error creating certificate:", error);
    throw new Error("Failed to create certificate: " + error.message);
  }
}

/**
 * Get certificate by ID
 */
export async function getCertificateById(certificateId) {
  try {
    const db = getDB();
    return await db.collection("certificates").findOne({ _id: certificateId });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    throw new Error("Failed to fetch certificate");
  }
}

/**
 * Get all certificates for a user (most recent first)
 */
export async function getUserCertificates(userId) {
  try {
    const db = getDB();
    return await db
      .collection("certificates")
      .find({ user_id: userId })
      .sort({ issued_date: -1 })
      .toArray();
  } catch (error) {
    console.error("Error fetching user certificates:", error);
    throw new Error("Failed to fetch certificates");
  }
}

/**
 * Get all issued certificates for admin dashboard
 */
export async function getAllCertificates(filter = {}) {
  try {
    const db = getDB();
    const certificates = db.collection("certificates");

    return await certificates
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "profiles",
            localField: "user_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $sort: { issued_date: -1 } },
      ])
      .toArray();
  } catch (error) {
    console.error("Error fetching all certificates:", error);
    throw new Error("Failed to fetch certificates");
  }
}

/**
 * Update certificate download status
 */
export async function updateCertificateDownloadStatus(certificateId) {
  try {
    const db = getDB();
    await db.collection("certificates").updateOne(
      { _id: certificateId },
      {
        $set: {
          is_downloaded: true,
          last_downloaded: new Date(),
          updated_at: new Date(),
        },
      }
    );
  } catch (error) {
    console.error("Error updating certificate download status:", error);
    throw new Error("Failed to update certificate");
  }
}

/**
 * Delete certificate
 */
export async function deleteCertificate(certificateId) {
  try {
    const db = getDB();
    const result = await db.collection("certificates").deleteOne({ _id: certificateId });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting certificate:", error);
    throw new Error("Failed to delete certificate");
  }
}
