import express from "express";
import mongoose from "mongoose";

import { store } from "../data/store.js";
import Order from "../models/Order.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const isDatabaseReady = () => mongoose.connection.readyState === 1;

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const orders = isDatabaseReady()
      ? await Order.find({ user: req.user._id }).sort({ orderedAt: -1, createdAt: -1 })
      : await store.listOrdersByUser(req.user._id);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      productId,
      productName,
      category,
      brand,
      size,
      price,
      emoji,
    } = req.body;

    if (!productId || !productName || !category || !brand || !size || price == null) {
      return res.status(400).json({ message: "Incomplete order details." });
    }

    const order = isDatabaseReady()
      ? await Order.create({
          user: req.user._id,
          productId,
          productName,
          category,
          brand,
          size,
          price,
          emoji,
          customerName: req.user.name,
          status: "Order placed",
          orderedAt: new Date(),
        })
      : await store.createOrder({
          user: req.user._id,
          productId,
          productName,
          category,
          brand,
          size,
          price,
          emoji,
          customerName: req.user.name,
          status: "Order placed",
          orderedAt: new Date().toISOString(),
        });

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

export default router;
