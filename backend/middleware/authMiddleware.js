import { verifyToken } from "../utils/jwt.js";

export function verifyUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin" && req.user?.role !== "post_holder") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export function requireAdminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Administrator access required" });
  }
  next();
}

export default verifyUser;
