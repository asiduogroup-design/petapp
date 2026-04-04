import mongoose from "mongoose";
import User from "../models/User.js";
import { store } from "../data/store.js";
import { verifyAuthToken } from "../helpers/token.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const payload = verifyAuthToken(token);

    if (!payload?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = mongoose.connection.readyState === 1
      ? await User.findById(payload.userId).select("-passwordHash")
      : await store.findUserById(payload.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const safeUser = mongoose.connection.readyState === 1
      ? user
      : {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        };

    req.user = safeUser;
    next();
  } catch (error) {
    next(error);
  }
};
