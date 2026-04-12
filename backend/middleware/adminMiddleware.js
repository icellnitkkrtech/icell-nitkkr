export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.user.role !== "admin" && req.user.role !== "post_holder") {
    return res.status(403).json({ error: "Admin access only" });
  }

  next();
};
