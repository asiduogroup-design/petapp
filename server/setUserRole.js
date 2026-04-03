// Run this script with: node setUserRole.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

async function setUserRole(email, role) {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await User.updateOne({ email }, { $set: { role } });
  if (result.modifiedCount > 0) {
    console.log(`${email} role set to ${role}.`);
  } else {
    console.log(`User not found or already has role ${role}.`);
  }
  await mongoose.disconnect();
}

// Change the email and role below as needed
setUserRole("kalyanbapti@gmail.com", "admin");
