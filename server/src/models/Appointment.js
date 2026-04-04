import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    petName: {
      type: String,
      required: true,
      trim: true,
    },
    petType: {
      type: String,
      required: true,
      trim: true,
    },
    doctor: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    issue: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      default: "Booked",
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    canceledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Appointment", appointmentSchema);
