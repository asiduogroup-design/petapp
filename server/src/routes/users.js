import { Router } from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = Router();

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

router.get("/all", requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
