import { Router } from "express";
import {
  downloadCertificate,
  getUserCertificates,
  getAllIssuedCertificates,
  deleteCertificate,
} from "../controllers/certificateController.js";
import verifyUser, { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// User routes - require authentication
router.get("/user/all", verifyUser, getUserCertificates);
router.get("/download/:certificateId", verifyUser, downloadCertificate);
router.get("/preview/:certificateId", verifyUser, downloadCertificate);

// Legacy aliases for backward compatibility
router.get("/dynamic/download/:certificateId", verifyUser, downloadCertificate);
router.get("/info", verifyUser, getUserCertificates);

// Admin / Post Holder routes
router.get("/admin/all", verifyUser, requireAdmin, getAllIssuedCertificates);
router.delete("/admin/:certificateId", verifyUser, requireAdmin, deleteCertificate);

export default router;
