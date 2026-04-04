import { Router } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken, authMiddleware } from "../utils/auth.js";
const router = Router();

// Admin: Get all users
router.get("/all", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });
  const users = await User.find().select("-password");
  res.json(users);
});

// Admin: Block user
router.patch("/:id/block", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });
  await User.findByIdAndUpdate(req.params.id, { isBlocked: true });
  res.json({ message: "User blocked" });
});

// Admin: Unblock user
router.patch("/:id/unblock", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });
  await User.findByIdAndUpdate(req.params.id, { isBlocked: false });
  res.json({ message: "User unblocked" });
});

// Admin: Change user role
router.patch("/:id/role", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });
  const { role } = req.body;
  if (!role || !["user", "admin"].includes(role)) return res.status(400).json({ message: "Invalid role" });
  await User.findByIdAndUpdate(req.params.id, { role });
  res.json({ message: `User role set to ${role}` });
});

// Admin: Delete user
router.delete("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});


// Register endpoint
router.post("/register", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "MongoDB is not connected." });
  }
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: hashed });
    return res.status(201).json({ message: "Registration successful." });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed.", error: error.message });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "MongoDB is not connected." });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    // Fetch latest user data to ensure role is up-to-date
    const freshUser = await User.findById(user._id);
    const token = generateToken(freshUser);
    return res.json({ message: "Login successful.", token });
  } catch (error) {
    return res.status(500).json({ message: "Login failed.", error: error.message });
  }
});


// Example protected route
router.get("/me", authMiddleware, async (req, res) => {
  // req.user is set by authMiddleware
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

export default router;
