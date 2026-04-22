import { Router } from "express";
import jwt from "jsonwebtoken";
import Appointment from "../models/Appointment.js";

const router = Router();

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

// POST /api/appointments - Book a new appointment
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, phone, email, petName, petType, doctor, date, time, issue } = req.body;

    if (!name || !phone || !email || !petName || !petType || !doctor || !date || !time) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    const appointment = await Appointment.create({
      user: req.user.id,
      name,
      phone,
      email,
      petName,
      petType,
      doctor,
      date,
      time,
      issue: issue || "",
    });

    res.status(201).json({ message: "Appointment booked successfully.", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/appointments/my - Get all appointments for logged-in user
router.get("/my", requireAuth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/appointments - Get all appointments (admin only)
router.get("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/appointments/:id - Delete an appointment (admin only)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
