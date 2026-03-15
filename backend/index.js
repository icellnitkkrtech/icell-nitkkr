

// backend/index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes   from "./routes/authRoutes.js";
import blogRoutes   from "./routes/blogRoutes.js";
import eventsRoutes from "./routes/eventsRoutes.js";
import teamRoutes   from "./routes/teamRoutes.js";
import userRoutes   from "./routes/userRoutes.js";

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow any localhost port in development so you never hit this again
// when Vite picks 5174, 5175, etc.
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:4173", // vite preview
  process.env.FRONTEND_URL,          // your production URL from .env
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/api/health", (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use("/api/auth",   authRoutes);
app.use("/api/blogs",  blogRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/teams",  teamRoutes);
app.use("/api/users",  userRoutes);
// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message ?? "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});