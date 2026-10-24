// Certificate Controller - Template-based certificates
import * as certificateModel from "../models/certificateModel.js";
import * as templateModel from "../models/certificateTemplateModel.js";
import { renderCertificate } from "../utils/dynamicCertificateRenderer.js";

/**
 * Download or preview a certificate as PNG
 * GET /api/certificate/download/:certificateId
 */
export async function downloadCertificate(req, res) {
  try {
    const { certificateId } = req.params;
    const certificate = await certificateModel.getCertificateById(certificateId);

    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    // Verify ownership: recipient user or staff (admin/post_holder)
    const isOwner = certificate.user_id === req.user?.userId;
    const isStaff = req.user?.role === "admin" || req.user?.role === "post_holder";
    if (!isOwner && !isStaff) {
      return res.status(403).json({ error: "Unauthorized access to certificate" });
    }

    const template = await templateModel.getTemplateById(certificate.template_id);
    if (!template) {
      return res.status(404).json({ error: "Certificate template not found" });
    }

    const image = await renderCertificate(template, certificate.dynamic_data || {});
    await certificateModel.updateCertificateDownloadStatus(certificate._id);

    const safeTitle = (certificate.title || "certificate")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .toLowerCase();

    res.setHeader("Content-Type", "image/png");
    if (req.query.preview === "true" || req.query.inline === "true") {
      res.setHeader("Content-Disposition", `inline; filename="${safeTitle}.png"`);
    } else {
      res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}-${certificate._id}.png"`);
    }

    res.send(image);
  } catch (error) {
    console.error("Certificate download error:", error);
    res.status(500).json({ error: "Failed to generate certificate" });
  }
}

/**
 * Get all certificates for current logged-in user
 * GET /api/certificate/user/all
 */
export async function getUserCertificates(req, res) {
  try {
    const userId = req.user?.userId;
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
 * Get all issued certificates (Admin / Post Holder)
 * GET /api/certificate/admin/all
 */
export async function getAllIssuedCertificates(req, res) {
  try {
    const { templateId, limit = 1000, skip = 0 } = req.query;

    const filter = {};
    if (templateId && templateId !== "all") {
      filter.template_id = templateId;
    }

    const certificates = await certificateModel.getAllCertificates(filter);

    const transformedCerts = certificates.map((cert) => ({
      ...cert,
      user_name:
        cert.user?.name ||
        cert.dynamic_data?.name ||
        cert.dynamic_data?.student_name ||
        "Unknown",
      user_email: cert.recipient_email || cert.user?.email || "N/A",
    }));

    res.json({
      success: true,
      certificates: transformedCerts.slice(skip, skip + parseInt(limit)),
      total: transformedCerts.length,
    });
  } catch (error) {
    console.error("Error fetching admin certificates:", error);
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
}

/**
 * Delete certificate (Admin only)
 * DELETE /api/certificate/admin/:certificateId
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

// Aliases for backward compatibility
export const downloadDynamicCertificate = downloadCertificate;
export const previewCertificate = downloadCertificate;
