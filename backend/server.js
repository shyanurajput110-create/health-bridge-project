// server.js
// HealthBridge - Full Stack Healthcare Management Application
// Entry point: wires up middleware, routes, and starts the API server.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---------- API routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/appointments", appointmentRoutes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "HealthBridge API is running." });
});

// ---------- Serve frontend (static files) ----------
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");
app.use(express.static(FRONTEND_DIR));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

// ---------- 404 & error handling ----------
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found." });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`HealthBridge server running at http://localhost:${PORT}`);
});
