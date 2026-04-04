import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "+91 0000000000",
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  addresses: { type: [mongoose.Schema.Types.Mixed], default: [] },
  isBlocked: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  profileImage: { type: String, default: "" },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
