import express from "express";
import multer from "multer";
import verifyUser, { requireAdminOnly } from "../middleware/authMiddleware.js";
import { listCertificateTemplates, getCertificateTemplate, createCertificateTemplate, updateCertificateTemplate, deleteCertificateTemplate } from "../controllers/certificateTemplateController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_req, file, callback) => callback(null, ["image/png", "image/jpeg"].includes(file.mimetype)) });

router.get("/", verifyUser, listCertificateTemplates);
router.get("/:id", verifyUser, getCertificateTemplate);
router.post("/", verifyUser, requireAdminOnly, upload.single("background"), createCertificateTemplate);
router.patch("/:id", verifyUser, requireAdminOnly, upload.single("background"), updateCertificateTemplate);
router.delete("/:id", verifyUser, requireAdminOnly, deleteCertificateTemplate);

export default router;
