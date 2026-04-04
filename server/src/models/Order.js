import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
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
