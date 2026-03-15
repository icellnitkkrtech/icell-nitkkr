// middleware/verifyAdmin.js
import supabase from "../services/supabaseClient.js";

export default async function verifyAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile.role !== "admin") {
      return res.status(403).json({ error: "Admins only" });
    }

    req.user = user;
    console.log("Admin access granted for user:", user.id);
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}