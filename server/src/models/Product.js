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
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
