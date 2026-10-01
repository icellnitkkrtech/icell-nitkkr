import { getDB } from "../config/mongodb.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a certificate record
 * @param {string} userId - User ID receiving certificate
 * @param {string} certificateType - Type: "member", "post_holder", "event"
 * @param {object} data - Additional certificate data
 */
export async function createCertificate(userId, certificateType, data) {
  try {
    const db = getDB();
    const certificates = db.collection("certificates");

    const certificate = {
      _id: uuidv4(),
      user_id: userId,
      certificate_type: certificateType, // "member", "post_holder", "event"
      title: data.title || "",
      description: data.description || "",
      achievement: data.achievement || "", // For event certificates
      issued_date: new Date(),
      post_position: data.post_position || null, // For post_holder type
      metadata: data.metadata || {},
      is_downloaded: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await certificates.insertOne(certificate);
    return result.insertedId;
  } catch (error) {
    console.error("Error creating certificate:", error);
    throw new Error("Failed to create certificate");
  }
}

/**
 * Get all certificates for a user
 */
export async function getUserCertificates(userId) {
  try {
    const db = getDB();
    const certificates = db.collection("certificates");

    return await certificates
      .find({ user_id: userId })
      .sort({ issued_date: -1 })
      .toArray();
  } catch (error) {
    console.error("Error fetching user certificates:", error);
    throw new Error("Failed to fetch certificates");
  }
}

/**
 * Get certificate by ID
 */
export async function getCertificateById(certificateId) {
  try {
    const db = getDB();
    const certificates = db.collection("certificates");

    return await certificates.findOne({ _id: certificateId });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    throw new Error("Failed to fetch certificate");
  }
}

/**
 * Get certificates by type for a user
 */
export async function getCertificatesByType(userId, certificateType) {
  try {
    const db = getDB();
    const certificates = db.collection("certificates");

    return await certificates
      .find({ user_id: userId, certificate_type: certificateType })
      .sort({ issued_date: -1 })
      .toArray();
  } catch (error) {
    console.error("Error fetching certificates by type:", error);
    throw new Error("Failed to fetch certificates");
  }
}

/**
 * Create multiple certificates from CSV data
 */
export async function createBulkCertificates(certificatesData) {
  try {
    const db = getDB();
    const certificates = db.collection("certificates");

    const bulkOps = certificatesData.map((cert) => ({
      insertOne: {
        document: {
          _id: uuidv4(),
          user_id: cert.user_id,
          certificate_type: "event",
          title: cert.title || "Event Achievement",
          description: cert.description || "",
          achievement: cert.achievement || "",
          issued_date: new Date(),
          metadata: {
            csv_batch: cert.batch_id,
            email: cert.email,
          },
          is_downloaded: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      },
    }));

    if (bulkOps.length === 0) return { insertedCount: 0 };

    const result = await certificates.bulkWrite(bulkOps);
    return {
      insertedCount: result.insertedCount,
      insertedIds: Object.values(result.insertedIds),
    };
  } catch (error) {
    console.error("Error creating bulk certificates:", error);
    throw new Error("Failed to create bulk certificates");
  }
}

export async function createDynamicCertificate({
  userId,
  title,
  templateId,
  data,
  email,
  batchId,
  issuedBy,
}) {
  const db = getDB();
  const certificate = {
    _id: uuidv4(),
    user_id: userId,
    certificate_type: "dynamic",
    title,
    description: "",
    achievement: "",
    issued_date: new Date(),
    metadata: {
      template_id: templateId,
      dynamic_data: data,
      email,
      batch_id: batchId,
      issued_by: issuedBy,
    },
    is_downloaded: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  await db.collection("certificates").insertOne(certificate);
  return certificate;
}

/**
 * Get all issued certificates (for admin dashboard)
 */
export async function getAllCertificates(filter = {}) {
  try {
    const db = getDB();
    const certificates = db.collection("certificates");
    const profiles = db.collection("profiles");

    // Aggregate certificates with user data
    const certs = await certificates
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

    return certs;
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
    const certificates = db.collection("certificates");

    await certificates.updateOne(
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
    console.error("Error updating certificate:", error);
    throw new Error("Failed to update certificate");
  }
}

/**
 * Check if user has a specific certificate type
 */
export async function hasCertificateType(userId, certificateType) {
  try {
    const db = getDB();
    const certificates = db.collection("certificates");

    const cert = await certificates.findOne({
      user_id: userId,
      certificate_type: certificateType,
    });

    return !!cert;
  } catch (error) {
    console.error("Error checking certificate:", error);
    return false;
  }
}

/**
 * Delete certificate
 */
export async function deleteCertificate(certificateId) {
  try {
    const db = getDB();
    const certificates = db.collection("certificates");

    const result = await certificates.deleteOne({ _id: certificateId });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting certificate:", error);
    throw new Error("Failed to delete certificate");
  }
}
