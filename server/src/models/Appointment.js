import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  petName: { type: String, required: true },
  petType: { type: String, required: true },
  numberOfPets: { type: Number, required: true, min: 1, max: 10 },
  doctor: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  timeSlot: { type: String, required: true }, // Format: HH:MM (24-hour format, e.g., "10:00")
  issue: { type: String, default: "" },
  status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
export default Appointment;
