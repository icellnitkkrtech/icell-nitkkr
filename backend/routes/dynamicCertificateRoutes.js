import express from "express";
import multer from "multer";
import verifyUser from "../middleware/authMiddleware.js";
import { previewDynamicCertificate, generateDynamicCertificates } from "../controllers/dynamicCertificateController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, callback) => callback(null, file.mimetype === "text/csv" || /\.csv$/i.test(file.originalname || "")) });

router.post("/preview", verifyUser, previewDynamicCertificate);
router.post("/generate", verifyUser, upload.single("file"), generateDynamicCertificates);

export default router;
