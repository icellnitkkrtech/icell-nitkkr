// Certificate Controller
import * as authModel from "../models/authModel.js";
import * as certificateModel from "../models/certificateModel.js";
import * as templateModel from "../models/certificateTemplateModel.js";
import { renderCertificate } from "../utils/dynamicCertificateRenderer.js";
import { getDB } from "../config/mongodb.js";
import {
  generateMemberCertificateHTML,
  generateMemberCertificateSVG,
  generatePostHolderCertificateHTML,
  generatePostHolderCertificateSVG,
  generateEventCertificateHTML,
  generateEventCertificateSVG,
} from "../utils/certificateService.js";

/**
 * Generate and download member certificate as SVG
 */
export async function downloadMemberCertificate(req, res) {
  try {
    const userId = req.user.userId;
    const user = await authModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has member certificate record
    let certificate = await certificateModel.getCertificatesByType(
      userId,
      "member"
    );

    if (!certificate || certificate.length === 0) {
      return res.status(404).json({ error: "Member certificate not found" });
    }

    const svgCertificate = generateMemberCertificateSVG(
      user.name,
      user.branch || "N/A",
      user.year || "N/A"
    );

    // Update download status
    await certificateModel.updateCertificateDownloadStatus(certificate[0]._id);

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="icell-membership-certificate-${user.name.replace(
        /\s+/g,
        "-"
      )}.svg"`
    );

    res.send(svgCertificate);
  } catch (error) {
    console.error("Certificate download error:", error);
    res.status(500).json({ error: "Failed to generate certificate" });
  }
}

/**
 * Download post holder certificate
 */
export async function downloadPostHolderCertificate(req, res) {
  try {
    const userId = req.user.userId;
    const user = await authModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.post_position) {
      return res.status(403).json({ error: "User is not a post holder" });
    }

    // Check if certificate exists
    let certificate = await certificateModel.getCertificatesByType(
      userId,
      "post_holder"
    );

    if (!certificate || certificate.length === 0) {
      return res
        .status(404)
        .json({ error: "Post holder certificate not found" });
    }

    const svgCertificate = generatePostHolderCertificateSVG(
      user.name,
      user.branch || "N/A",
      user.year || "N/A",
      user.post_position
    );

    // Update download status
    await certificateModel.updateCertificateDownloadStatus(certificate[0]._id);

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="icell-postholder-certificate-${user.name.replace(
        /\s+/g,
        "-"
      )}.svg"`
    );

    res.send(svgCertificate);
  } catch (error) {
    console.error("Post holder certificate error:", error);
    res.status(500).json({ error: "Failed to generate certificate" });
  }
}

/**
 * Download specific event achievement certificate
 */
export async function downloadEventCertificate(req, res) {
  try {
    const userId = req.user.userId;
    const { certificateId } = req.params;

    const user = await authModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get certificate and verify ownership
    const certificate = await certificateModel.getCertificateById(
      certificateId
    );

    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    if (certificate.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const svgCertificate = generateEventCertificateSVG(
      user.name,
      user.branch || "N/A",
      user.year || "N/A",
      certificate.achievement || certificate.title
    );

    // Update download status
    await certificateModel.updateCertificateDownloadStatus(certificateId);

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="icell-achievement-certificate-${user.name.replace(
        /\s+/g,
        "-"
      )}.svg"`
    );

    res.send(svgCertificate);
  } catch (error) {
    console.error("Event certificate error:", error);
    res.status(500).json({ error: "Failed to generate certificate" });
  }
}

export async function downloadDynamicCertificate(req, res) {
  try {
    const certificate = await certificateModel.getCertificateById(req.params.certificateId);
    if (!certificate || certificate.certificate_type !== "dynamic") {
      return res.status(404).json({ error: "Certificate not found" });
    }
    if (certificate.user_id !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const template = await templateModel.getTemplateById(certificate.metadata?.template_id);
    if (!template) return res.status(404).json({ error: "Certificate template not found" });

    const image = await renderCertificate(template, certificate.metadata.dynamic_data || {});
    await certificateModel.updateCertificateDownloadStatus(certificate._id);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename="${certificate.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${certificate._id}.png"`);
    res.send(image);
  } catch (error) {
    console.error("Dynamic certificate download error:", error);
    res.status(500).json({ error: "Failed to generate certificate" });
  }
}

/**
 * Get all certificates for current user
 */
export async function getUserCertificates(req, res) {
  try {
    const userId = req.user.userId;

    const certificates = await certificateModel.getUserCertificates(userId);

    res.json({
      success: true,
      certificates: certificates || [],
      total: certificates ? certificates.length : 0,
    });
  } catch (error) {
    console.error("Error fetching user certificates:", error);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
}

/**
 * Get all issued certificates (admin only)
 */
export async function getAllIssuedCertificates(req, res) {
  try {
    const { type, limit = 100, skip = 0 } = req.query;

    let filter = {};
    if (type && type !== "all") {
      filter.certificate_type = type;
    }

    const certificates = await certificateModel.getAllCertificates(filter);

    // Transform data to include user_name and user_email at root level
    const transformedCerts = certificates.map((cert) => ({
      ...cert,
      user_name: cert.user?.name || cert.metadata?.name || "Unknown",
      user_email: cert.user?.email || cert.metadata?.email || "N/A",
    }));

    res.json({
      success: true,
      certificates: transformedCerts.slice(skip, skip + parseInt(limit)),
      total: transformedCerts.length,
    });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
}

/**
 * Upload and process CSV for event certificates
 */
export async function uploadCertificateCSV(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const csvContent = req.file.buffer.toString("utf-8");
    const batchId = `batch_${Date.now()}`;
    const lines = csvContent.trim().split("\n");

    if (lines.length < 2) {
      return res.status(400).json({
        error: "CSV must contain header row and at least one data row",
      });
    }

    // Parse header
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const emailIdx = headers.indexOf("email");
    const nameIdx = headers.indexOf("name");
    const achievementIdx = headers.indexOf("achievement");

    if (emailIdx === -1 || nameIdx === -1 || achievementIdx === -1) {
      return res.status(400).json({
        error: "CSV must have columns: email, name, achievement",
      });
    }

    // Parse data rows
    const certificatesData = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(",").map((c) => c.trim());

      if (!cells[emailIdx] || !cells[nameIdx] || !cells[achievementIdx]) {
        errors.push(`Row ${i + 1}: Missing required data`);
        continue;
      }

      const email = cells[emailIdx];
      const name = cells[nameIdx];
      const achievement = cells[achievementIdx];

      // Find user by email
      try {
        const user = await authModel.getUserByEmail(email);
        if (!user) {
          errors.push(`Row ${i + 1}: User not found for email ${email}`);
          continue;
        }

        certificatesData.push({
          user_id: user._id,
          email,
          name,
          achievement,
          batch_id: batchId,
        });
      } catch (err) {
        errors.push(`Row ${i + 1}: Error processing user: ${err.message}`);
      }
    }

    if (certificatesData.length === 0) {
      return res.status(400).json({
        error: "No valid users found in CSV",
        errors,
      });
    }

    // Create bulk certificates
    const result = await certificateModel.createBulkCertificates(
      certificatesData
    );

    res.json({
      success: true,
      message: `${certificatesData.length} certificates created`,
      batch_id: batchId,
      certificate_ids: result.insertedIds || [],
      count: certificatesData.length,
      totalProcessed: lines.length - 1,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("CSV upload error:", error);
    res.status(500).json({ error: "Failed to process CSV" });
  }
}

/**
 * Issue/Confirm certificate from CSV batch
 */
export async function issueCertificateFromBatch(req, res) {
  try {
    const { batchId, certificateIds } = req.body;

    if (!batchId) {
      return res.status(400).json({
        error: "Batch ID is required",
      });
    }

    // Mark certificates as issued in batch
    const db = getDB();
    const certificates = db.collection("certificates");

    // If certificateIds are provided, use them; otherwise, find by batch_id
    let query;
    if (certificateIds && certificateIds.length > 0) {
      query = { _id: { $in: certificateIds } };
    } else {
      query = { "metadata.csv_batch": batchId };
    }

    const result = await certificates.updateMany(query, {
      $set: {
        status: "issued",
        issued_by: req.user.userId,
        updated_at: new Date(),
      },
    });

    res.json({
      success: true,
      message: `${result.modifiedCount} certificates issued`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Certificate issuance error:", error);
    res.status(500).json({ error: "Failed to issue certificates" });
  }
}

/**
 * Get certificate preview
 */
export async function previewCertificate(req, res) {
  try {
    const { certificateId } = req.params;

    const certificate = await certificateModel.getCertificateById(
      certificateId
    );

    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    const user = await authModel.getUserById(certificate.user_id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let htmlCertificate;

    switch (certificate.certificate_type) {
      case "member":
        htmlCertificate = generateMemberCertificateHTML(
          user.name,
          user.branch || "N/A",
          user.year || "N/A"
        );
        break;
      case "post_holder":
        htmlCertificate = generatePostHolderCertificateHTML(
          user.name,
          user.branch || "N/A",
          user.year || "N/A",
          user.post_position
        );
        break;
      case "event":
        htmlCertificate = generateEventCertificateHTML(
          user.name,
          user.branch || "N/A",
          user.year || "N/A",
          certificate.achievement || certificate.title
        );
        break;
      default:
        htmlCertificate = generateMemberCertificateHTML(
          user.name,
          user.branch || "N/A",
          user.year || "N/A"
        );
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(htmlCertificate);
  } catch (error) {
    console.error("Certificate preview error:", error);
    res.status(500).json({ error: "Failed to generate preview" });
  }
}

/**
 * Delete certificate (admin only)
 */
export async function deleteCertificate(req, res) {
  try {
    const { certificateId } = req.params;

    const deleted = await certificateModel.deleteCertificate(certificateId);

    if (!deleted) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    res.json({ success: true, message: "Certificate deleted successfully" });
  } catch (error) {
    console.error("Certificate deletion error:", error);
    res.status(500).json({ error: "Failed to delete certificate" });
  }
}
