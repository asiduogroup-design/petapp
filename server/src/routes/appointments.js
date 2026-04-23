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

// Helper function to generate all 15-minute time slots for a day (8 AM to 8 PM)
function generateTimeSlots() {
  const slots = [];
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    }
  }
  return slots;
}

// GET /api/appointments/available/:doctor/:date - Get available time slots for a doctor
router.get("/available/:doctor/:date", async (req, res) => {
  try {
    const { doctor, date } = req.params;
    
    console.log(`Fetching slots for doctor: "${doctor}" on date: ${date}`);
    
    // Generate all possible 15-minute slots from 8 AM to 8 PM
    const allSlots = generateTimeSlots();
    
    // Find booked appointments for this doctor on this date
    const bookedAppointments = await Appointment.find({
      doctor: doctor,
      date: date,
      status: { $ne: "cancelled" },
    });
    
    console.log(`Found ${bookedAppointments.length} booked appointments`);
    
    const bookedSlots = bookedAppointments.map((apt) => apt.timeSlot);
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));
    
    res.json({ availableSlots, bookedSlots });
  } catch (err) {
    console.error("Error fetching available slots:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/appointments - Book a new appointment
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, phone, email, petName, petType, numberOfPets, doctor, date, timeSlot, issue } = req.body;

    if (!name || !phone || !email || !petName || !petType || !numberOfPets || !doctor || !date || !timeSlot) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    // Check if slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctor,
      date,
      timeSlot,
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      return res.status(409).json({ message: "This time slot is already booked. Please select another." });
    }

    const appointment = await Appointment.create({
      user: req.user.id,
      name,
      phone,
      email,
      petName,
      petType,
      numberOfPets,
      doctor,
      date,
      timeSlot,
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
