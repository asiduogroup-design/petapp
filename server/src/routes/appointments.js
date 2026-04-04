import express from "express";
import mongoose from "mongoose";

import { store } from "../data/store.js";
import Appointment from "../models/Appointment.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const isDatabaseReady = () => mongoose.connection.readyState === 1;

const parseAppointmentDateTime = ({ date, time }) => {
  const appointmentDate = new Date(date);
  if (Number.isNaN(appointmentDate.getTime())) {
    return null;
  }

  const match = String(time || "").match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  appointmentDate.setHours(hours, minutes, 0, 0);
  return appointmentDate;
};

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const appointments = isDatabaseReady()
      ? await Appointment.find({ user: req.user._id }).sort({ date: 1, time: 1, createdAt: -1 })
      : await store.listAppointmentsByUser(req.user._id);
    res.json({ appointments });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, phone, email, petName, petType, doctor, date, time, issue } = req.body;

    if (!name || !phone || !email || !petName || !petType || !doctor || !date || !time) {
      return res.status(400).json({ message: "Please fill all required appointment details." });
    }

    const appointmentDateTime = parseAppointmentDateTime({ date, time });
    if (!appointmentDateTime) {
      return res.status(400).json({ message: "Invalid appointment date or time." });
    }

    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({ message: "Appointments must be booked for a future time." });
    }

    const appointment = isDatabaseReady()
      ? await Appointment.create({
          user: req.user._id,
          name,
          phone,
          email,
          petName,
          petType,
          doctor,
          date,
          time,
          issue,
          status: "Booked",
          bookedAt: new Date(),
        })
      : await store.createAppointment({
          user: req.user._id,
          name,
          phone,
          email,
          petName,
          petType,
          doctor,
          date,
          time,
          issue,
          status: "Booked",
          bookedAt: new Date().toISOString(),
        });

    res.status(201).json({ appointment });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/cancel", async (req, res, next) => {
  try {
    const appointment = isDatabaseReady()
      ? await Appointment.findOne({ _id: req.params.id, user: req.user._id })
      : await store.findAppointmentByIdForUser(req.params.id, req.user._id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (appointment.status === "Canceled") {
      return res.status(400).json({ message: "Appointment is already canceled." });
    }

    const appointmentDateTime = parseAppointmentDateTime(appointment);
    if (!appointmentDateTime) {
      return res.status(400).json({ message: "Unable to validate appointment time." });
    }

    const timeLeft = appointmentDateTime.getTime() - Date.now();
    if (timeLeft <= 60 * 60 * 1000) {
      return res.status(400).json({ message: "Appointments cannot be canceled within 1 hour of the visit." });
    }

    const updatedAppointment = isDatabaseReady()
      ? await (async () => {
          appointment.status = "Canceled";
          appointment.canceledAt = new Date();
          await appointment.save();
          return appointment;
        })()
      : await store.updateAppointment(req.params.id, () => ({
          status: "Canceled",
          canceledAt: new Date().toISOString(),
        }));

    res.json({ appointment: updatedAppointment });
  } catch (error) {
    next(error);
  }
});

export default router;
