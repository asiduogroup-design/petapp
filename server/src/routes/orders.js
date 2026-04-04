import { Router } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import { authMiddleware } from "../utils/auth.js";

const router = Router();

// Get all orders (admin only)
router.get("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  res.json(orders);
});

// Update order status (admin only)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });
  const { status } = req.body;
  if (!status || !["pending", "completed", "cancelled"].includes(status)) return res.status(400).json({ message: "Invalid status" });
  await Order.findByIdAndUpdate(req.params.id, { status });
  res.json({ message: `Order status set to ${status}` });
});

// Delete order (admin only)
router.delete("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admins only" });
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Order deleted" });
});

export default router;
