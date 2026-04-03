// Run this script with: node makeAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

async function makeAdmin(email) {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await User.updateOne({ email }, { $set: { isAdmin: true } });
  if (result.modifiedCount > 0) {
    console.log(`${email} is now an admin.`);
  } else {
    console.log(`User not found or already admin.`);
  }
  await mongoose.disconnect();
}

// Change the email below to your target user
makeAdmin("kalyanbapti@gmail.com");
