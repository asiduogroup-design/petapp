import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product.js";

const router = Router();

// Get all products
router.get("/", async (_req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.json(products);
    }
    return res.json([]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
});

// Add a new product (admin only, simple check)
router.post("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "MongoDB is not connected. Add MONGO_URI to enable writes." });
    }
    const { name, category, quantity, description } = req.body;
    if (!name || !category || !description || quantity == null) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const product = await Product.create({ name, category, quantity, description });
    return res.status(201).json(product);
  } catch (error) {
    return res.status(400).json({ message: "Failed to create product", error: error.message });
  }
});

export default router;
