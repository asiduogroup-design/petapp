import { Router } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import jwt from "jsonwebtoken";

const router = Router();

const isRazorpayMockMode = () =>
  process.env.RAZORPAY_MOCK === "true" ||
  !process.env.RAZORPAY_KEY_ID ||
  !process.env.RAZORPAY_KEY_SECRET ||
  process.env.RAZORPAY_KEY_ID.includes("dummy") ||
  process.env.RAZORPAY_KEY_SECRET.includes("dummy");

const createRazorpaySignature = (orderId, paymentId) =>
  crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "dummyKeySecret")
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are not configured.");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Middleware to check for valid JWT
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Get all orders for a specific user (user order history)
router.get("/my", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete an order (admin only)
router.delete(":id", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    await Order.findByIdAndDelete(req.params.id);

    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all orders (admin only)
router.get("/", requireAuth, async (req, res) => {
  try {
    // Only admin can see all orders
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Razorpay order before opening Checkout
router.post("/razorpay/create", requireAuth, async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;
    const amountInRupees = Number(amount);

    if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
      return res.status(400).json({ message: "A valid amount is required." });
    }

    if (isRazorpayMockMode()) {
      const razorpayOrderId = `order_mock_${Date.now()}`;
      const mockPaymentId = `pay_mock_${Date.now()}`;

      return res.status(201).json({
        key: process.env.RAZORPAY_KEY_ID || "rzp_test_dummyKeyId",
        razorpayOrderId,
        amount: Math.round(amountInRupees * 100),
        currency,
        mock: true,
        mockPaymentId,
        mockSignature: createRazorpaySignature(razorpayOrderId, mockPaymentId),
      });
    }

    const razorpay = getRazorpayClient();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amountInRupees * 100),
      currency,
      receipt: `petapp_${Date.now()}`,
      notes: {
        userId: req.user.id,
      },
    });

    res.status(201).json({
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Unable to create Razorpay order." });
  }
});

// Verify Razorpay payment signature, then save ecommerce order
router.post("/razorpay/verify", requireAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      total,
      billingDetails,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing Razorpay payment details." });
    }

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: "Order items are required." });
    }

    const expectedSignature = createRazorpaySignature(razorpay_order_id, razorpay_payment_id);

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed." });
    }

    const existingOrder = await Order.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existingOrder) {
      return res.json(existingOrder);
    }

    let verifiedTotal = Number(total || 0);

    if (!isRazorpayMockMode()) {
      const razorpay = getRazorpayClient();
      const verifiedRazorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
      verifiedTotal = Number(verifiedRazorpayOrder.amount || 0) / 100;
    }

    if (!Number.isFinite(verifiedTotal) || verifiedTotal <= 0) {
      return res.status(400).json({ message: "Unable to verify paid amount." });
    }

    const order = await Order.create({
      user: req.user.id,
      items,
      total: verifiedTotal,
      status: "completed",
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      billingDetails,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message || "Unable to verify payment." });
  }
});

// Create a new order (user)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { items, total } = req.body;
    const order = await Order.create({
      user: req.user.id,
      items,
      total,
      status: "pending",
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update order status (admin only)
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
