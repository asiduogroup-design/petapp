import express from "express";
import mongoose from "mongoose";

import { store } from "../data/store.js";
import User from "../models/User.js";
import { hashPassword, verifyPassword } from "../helpers/password.js";
import { createAuthToken } from "../helpers/token.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const isDatabaseReady = () => mongoose.connection.readyState === 1;

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const normalizedEmail = String(email).toLowerCase();
    const existingUser = isDatabaseReady()
      ? await User.findOne({ email: normalizedEmail })
      : await store.findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await hashPassword(password);
    const user = isDatabaseReady()
      ? await User.create({
          name,
          email,
          phone: phone || "+91 0000000000",
          passwordHash,
        })
      : await store.createUser({
          name,
          email,
          phone: phone || "+91 0000000000",
          passwordHash,
        });

    res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = String(email).toLowerCase();
    const user = isDatabaseReady()
      ? await User.findOne({ email: normalizedEmail })
      : await store.findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json({
      token: createAuthToken(String(user._id)),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
