import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: Number,
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    emoji: {
      type: String,
      default: "🐾",
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: "Order placed",
    },
    orderedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: String, required: true }, // You can change to ObjectId if you have a Product model
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      }
    ],
    total: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
    appointmentDate: { type: Date }, // For appointments
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
