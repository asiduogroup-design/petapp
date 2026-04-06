import { Router } from "express";
import User from "../models/User.js";

const router = Router();

// Dummy admin check middleware (replace with real JWT auth in production)
function requireAdmin(req, res, next) {
  // In production, decode JWT and check req.user.role === "admin"
  // For now, allow all requests (for testing)
  next();
}

// GET /api/users/all - Get all users (admin only)
router.get("/all", requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Exclude password field
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
