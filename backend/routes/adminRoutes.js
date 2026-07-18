// routes/adminRoutes.js
// Admin Module: Dashboard, Manage Doctors, Manage Patients, Manage Appointments, View Reports

const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate, authorize("admin"));

// @route GET /api/admin/reports  (dashboard summary counts)
router.get("/reports", (req, res) => {
  const totalPatients = db.prepare("SELECT COUNT(*) AS c FROM patients").get().c;
  const totalDoctors = db.prepare("SELECT COUNT(*) AS c FROM doctors").get().c;
  const totalAppointments = db.prepare("SELECT COUNT(*) AS c FROM appointments").get().c;
  const byStatus = db.prepare(`
    SELECT status, COUNT(*) AS count FROM appointments GROUP BY status
  `).all();
  const upcoming = db.prepare(`
    SELECT COUNT(*) AS c FROM appointments WHERE appointment_date >= date('now') AND status IN ('pending','confirmed')
  `).get().c;

  res.json({
    success: true,
    report: { totalPatients, totalDoctors, totalAppointments, upcoming, appointmentsByStatus: byStatus }
  });
});

// @route GET /api/admin/doctors
router.get("/doctors", (req, res) => {
  const rows = db.prepare(`
    SELECT d.id AS doctor_id, u.id AS user_id, u.name, u.email, u.phone,
           d.specialization, d.experience_years, d.fees, d.available_days
    FROM doctors d JOIN users u ON u.id = d.user_id
    ORDER BY u.name
  `).all();
  res.json({ success: true, doctors: rows });
});

// @route POST /api/admin/doctors  (admin creates a doctor account)
router.post("/doctors", (req, res) => {
  const { name, email, password, phone, specialization, experience_years, fees } = req.body;
  if (!name || !email || !password || !specialization) {
    return res.status(400).json({ success: false, message: "name, email, password and specialization are required." });
  }
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return res.status(409).json({ success: false, message: "Email already in use." });

  const hashed = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'doctor')"
  ).run(name, email, hashed, phone || null);

  db.prepare(
    "INSERT INTO doctors (user_id, specialization, experience_years, fees) VALUES (?, ?, ?, ?)"
  ).run(result.lastInsertRowid, specialization, experience_years || 0, fees || 0);

  res.status(201).json({ success: true, message: "Doctor account created." });
});

// @route DELETE /api/admin/doctors/:id
router.delete("/doctors/:id", (req, res) => {
  const doctor = db.prepare("SELECT * FROM doctors WHERE id = ?").get(req.params.id);
  if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found." });
  db.prepare("DELETE FROM users WHERE id = ?").run(doctor.user_id); // cascades to doctors table
  res.json({ success: true, message: "Doctor removed." });
});

// @route GET /api/admin/patients
router.get("/patients", (req, res) => {
  const rows = db.prepare(`
    SELECT p.id AS patient_id, u.id AS user_id, u.name, u.email, u.phone, p.dob, p.gender, p.blood_group
    FROM patients p JOIN users u ON u.id = p.user_id
    ORDER BY u.name
  `).all();
  res.json({ success: true, patients: rows });
});

// @route DELETE /api/admin/patients/:id
router.delete("/patients/:id", (req, res) => {
  const patient = db.prepare("SELECT * FROM patients WHERE id = ?").get(req.params.id);
  if (!patient) return res.status(404).json({ success: false, message: "Patient not found." });
  db.prepare("DELETE FROM users WHERE id = ?").run(patient.user_id);
  res.json({ success: true, message: "Patient removed." });
});

// @route GET /api/admin/appointments
router.get("/appointments", (req, res) => {
  const rows = db.prepare(`
    SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason,
           pu.name AS patient_name, du.name AS doctor_name, d.specialization
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    JOIN users pu ON pu.id = p.user_id
    JOIN doctors d ON d.id = a.doctor_id
    JOIN users du ON du.id = d.user_id
    ORDER BY a.appointment_date DESC
  `).all();
  res.json({ success: true, appointments: rows });
});

module.exports = router;
