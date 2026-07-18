// routes/authRoutes.js
// Authentication Module: Registration, Login, Logout (client-side token discard), current user info

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { authenticate, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// @route  POST /api/auth/register
// @desc   Register a new patient or doctor (admin accounts are created only by an existing admin)
router.post("/register", (req, res) => {
  try {
    const { name, email, password, phone, role, specialization, dob, gender } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "Name, email, password and role are required." });
    }
    if (!["patient", "doctor"].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be either 'patient' or 'doctor'." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const insertUser = db.prepare(
      "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)"
    );
    const result = insertUser.run(name, email, hashedPassword, phone || null, role);
    const userId = result.lastInsertRowid;

    if (role === "patient") {
      db.prepare("INSERT INTO patients (user_id, dob, gender) VALUES (?, ?, ?)").run(
        userId, dob || null, gender || null
      );
    } else if (role === "doctor") {
      db.prepare(
        "INSERT INTO doctors (user_id, specialization) VALUES (?, ?)"
      ).run(userId, specialization || "General Physician");
    }

    const token = jwt.sign({ id: userId, name, email, role }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: { id: userId, name, email, role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error during registration." });
  }
});

// @route  POST /api/auth/login
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
});

// @route  GET /api/auth/me
router.get("/me", authenticate, (req, res) => {
  const user = db.prepare("SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?").get(req.user.id);
  res.json({ success: true, user });
});

module.exports = router;
