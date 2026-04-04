import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { connectDB } from "./config/db.js";

import petRoutes from "./routes/pets.js";
import userRoutes from "./routes/users.js";
import orderRoutes from "./routes/orders.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "petapp-api" });
});


app.use("/api/pets", petRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

connectDB().finally(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
