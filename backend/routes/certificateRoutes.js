import { Router } from "express";
import {
  downloadMemberCertificate,
  downloadPostHolderCertificate,
  downloadEventCertificate,
  downloadDynamicCertificate,
  getUserCertificates,
  getAllIssuedCertificates,
  uploadCertificateCSV,
  issueCertificateFromBatch,
  previewCertificate,
  deleteCertificate,
} from "../controllers/certificateController.js";
import verifyUser, { requireAdmin } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// User routes - require authentication
router.get("/user/all", verifyUser, getUserCertificates);
router.get("/member/download", verifyUser, downloadMemberCertificate);
router.get("/postholder/download", verifyUser, downloadPostHolderCertificate);
router.get(
  "/event/download/:certificateId",
  verifyUser,
  downloadEventCertificate
);
router.get(
  "/dynamic/download/:certificateId",
  verifyUser,
  downloadDynamicCertificate
);
router.get("/preview/:certificateId", verifyUser, previewCertificate);

// Admin routes - require admin authentication
router.get("/admin/all", verifyUser, requireAdmin, getAllIssuedCertificates);
router.post(
  "/admin/upload-csv",
  verifyUser,
  requireAdmin,
  upload.single("file"),
  uploadCertificateCSV
);
router.post(
  "/admin/issue-batch",
  verifyUser,
  requireAdmin,
  issueCertificateFromBatch
);
router.delete(
  "/admin/:certificateId",
  verifyUser,
  requireAdmin,
  deleteCertificate
);

// Legacy routes for backward compatibility
router.get("/info", verifyUser, getUserCertificates);
router.get("/download", verifyUser, downloadMemberCertificate);
router.get("/preview", verifyUser, previewCertificate);

export default router;
