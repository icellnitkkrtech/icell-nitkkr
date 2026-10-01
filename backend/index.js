// backend/index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB, closeDB } from "./config/mongodb.js";
import { startCleanupJob, stopCleanupJob } from "./utils/cleanupService.js";

import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import eventsRoutes from "./routes/eventsRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
// import attendanceRoutes from "./routes/attendanceRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import galleryGroupRoutes from "./routes/galleryGroupRoutes.js";
import eventAttendanceRoutes from "./routes/eventAttendanceRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import certificateTemplateRoutes from "./routes/certificateTemplateRoutes.js";
import dynamicCertificateRoutes from "./routes/dynamicCertificateRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ────────────────────────────────────────────────────────
async function startServer() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Start background cleanup job for expired unverified student accounts
    startCleanupJob();
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }

  // ── CORS ──────────────────────────────────────────────────────────────────────
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:4173",
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // ── Routes ────────────────────────────────────────────────────────────────────
  app.get("/api/health", (_, res) =>
    res.json({ ok: true, ts: new Date().toISOString() })
  );

  app.use("/api/auth", authRoutes);
  app.use("/api/blogs", blogRoutes);
  app.use("/api/events", eventsRoutes);
  app.use("/api/teams", teamRoutes);
  app.use("/api/students", studentRoutes);
  // app.use("/api/attendance", attendanceRoutes);
  app.use("/api/event-attendance", eventAttendanceRoutes);
  app.use("/api/gallery", galleryRoutes);
  app.use("/api/gallery-groups", galleryGroupRoutes);
  app.use("/api/newsletters", newsletterRoutes);
  app.use("/api/certificate", certificateRoutes);
  app.use("/api/certificate-templates", certificateTemplateRoutes);
  app.use("/api/dynamic-certificates", dynamicCertificateRoutes);
  app.use("/api/admin", adminRoutes);

  // ── 404 ───────────────────────────────────────────────────────────────────────
  app.use((req, res) => {
    res
      .status(404)
      .json({ error: `Route not found: ${req.method} ${req.path}` });
  });

  // ── Global error handler ──────────────────────────────────────────────────────
  app.use((err, req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: err.message ?? "Internal server error" });
  });

  const server = app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
  });

  // ── Graceful shutdown ─────────────────────────────────────────────────────────
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received, closing server...");
    stopCleanupJob();
    server.close(async () => {
      await closeDB();
      process.exit(0);
    });
  });

  process.on("SIGINT", async () => {
    console.log("SIGINT received, closing server...");
    stopCleanupJob();
    server.close(async () => {
      await closeDB();
      process.exit(0);
    });
  });
}

startServer();
