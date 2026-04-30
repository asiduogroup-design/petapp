import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["food", "toys", "medicines", "clothing", "accessories"],
    },
    quantity: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true, default: "" },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
