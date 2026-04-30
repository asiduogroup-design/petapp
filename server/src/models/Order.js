import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: String, required: true },
      name: String,
      quantity: { type: Number, default: 1 },
      price: Number,
    }
  ],
  status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: "razorpay" },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  billingDetails: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    pincode: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
