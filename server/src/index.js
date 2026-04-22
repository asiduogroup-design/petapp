import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import petRoutes from "./routes/pets.js";
import userRoutes from "./routes/users.js";
import orderRoutes from "./routes/orders.js";
import productRoutes from "./routes/products.js";
import appointmentRoutes from "./routes/appointments.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "petapp-api" });
});



// Register all routes
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/appointments", appointmentRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

connectDB().finally(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on("error", (err) => {
    if (err?.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Stop the other process or set a different PORT.`
      );
      process.exit(1);
    }

    console.error("Server failed to start:", err);
    process.exit(1);
  });
});
