// routes/doctorRoutes.js
// Doctor Module: Dashboard, Manage Appointments, Update Patient Records, Profile

const express = require("express");
const db = require("../config/db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate, authorize("doctor"));

function getDoctorRecord(userId) {
  return db.prepare("SELECT * FROM doctors WHERE user_id = ?").get(userId);
}

// @route GET /api/doctors/profile
router.get("/profile", (req, res) => {
  const profile = db.prepare(`
    SELECT u.id, u.name, u.email, u.phone, d.specialization, d.experience_years, d.fees, d.available_days
    FROM users u JOIN doctors d ON d.user_id = u.id
    WHERE u.id = ?
  `).get(req.user.id);
  res.json({ success: true, profile });
});

// @route PUT /api/doctors/profile
router.put("/profile", (req, res) => {
  const { phone, specialization, experience_years, fees, available_days } = req.body;
  db.prepare("UPDATE users SET phone = ? WHERE id = ?").run(phone || null, req.user.id);
  db.prepare(`
    UPDATE doctors SET specialization = ?, experience_years = ?, fees = ?, available_days = ?
    WHERE user_id = ?
  `).run(specialization, experience_years || 0, fees || 0, available_days || "Mon-Sat", req.user.id);
  res.json({ success: true, message: "Profile updated successfully." });
});

// @route GET /api/doctors/patients  (patients this doctor has interacted with)
router.get("/patients", (req, res) => {
  const doctor = getDoctorRecord(req.user.id);
  const rows = db.prepare(`
    SELECT DISTINCT u.id AS patient_user_id, p.id AS patient_id, u.name, u.email, u.phone, p.dob, p.gender, p.blood_group
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    JOIN users u ON u.id = p.user_id
    WHERE a.doctor_id = ?
  `).all(doctor.id);
  res.json({ success: true, patients: rows });
});

// @route POST /api/doctors/medical-records  (add a record for a patient)
router.post("/medical-records", (req, res) => {
  const { patient_id, appointment_id, diagnosis, prescription, notes } = req.body;
  if (!patient_id || !diagnosis) {
    return res.status(400).json({ success: false, message: "patient_id and diagnosis are required." });
  }
  const doctor = getDoctorRecord(req.user.id);

  const result = db.prepare(`
    INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, prescription, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(patient_id, doctor.id, appointment_id || null, diagnosis, prescription || null, notes || null);

  res.status(201).json({ success: true, message: "Medical record added.", record_id: result.lastInsertRowid });
});

// @route GET /api/doctors/medical-records/:patientId
router.get("/medical-records/:patientId", (req, res) => {
  const doctor = getDoctorRecord(req.user.id);
  const rows = db.prepare(`
    SELECT * FROM medical_records WHERE patient_id = ? AND doctor_id = ? ORDER BY record_date DESC
  `).all(req.params.patientId, doctor.id);
  res.json({ success: true, records: rows });
});

module.exports = router;
