// routes/patientRoutes.js
// Patient Module: Dashboard, Profile, Medical Records, Doctor listing for booking

const express = require("express");
const db = require("../config/db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate, authorize("patient"));

function getPatientRecord(userId) {
  return db.prepare("SELECT * FROM patients WHERE user_id = ?").get(userId);
}

// @route GET /api/patients/profile
router.get("/profile", (req, res) => {
  const profile = db.prepare(`
    SELECT u.id, u.name, u.email, u.phone, p.dob, p.gender, p.address, p.blood_group
    FROM users u JOIN patients p ON p.user_id = u.id
    WHERE u.id = ?
  `).get(req.user.id);
  res.json({ success: true, profile });
});

// @route PUT /api/patients/profile
router.put("/profile", (req, res) => {
  const { phone, dob, gender, address, blood_group } = req.body;
  db.prepare("UPDATE users SET phone = ? WHERE id = ?").run(phone || null, req.user.id);
  db.prepare(
    "UPDATE patients SET dob = ?, gender = ?, address = ?, blood_group = ? WHERE user_id = ?"
  ).run(dob || null, gender || null, address || null, blood_group || null, req.user.id);
  res.json({ success: true, message: "Profile updated successfully." });
});

// @route GET /api/patients/doctors  (browse doctors to book an appointment)
router.get("/doctors", (req, res) => {
  const doctors = db.prepare(`
    SELECT d.id AS doctor_id, u.name, d.specialization, d.experience_years, d.fees, d.available_days
    FROM doctors d JOIN users u ON u.id = d.user_id
    ORDER BY u.name
  `).all();
  res.json({ success: true, doctors });
});

// @route GET /api/patients/medical-records
router.get("/medical-records", (req, res) => {
  const patient = getPatientRecord(req.user.id);
  if (!patient) return res.status(404).json({ success: false, message: "Patient profile not found." });

  const records = db.prepare(`
    SELECT mr.id, mr.diagnosis, mr.prescription, mr.notes, mr.record_date,
           u.name AS doctor_name, d.specialization
    FROM medical_records mr
    JOIN doctors d ON d.id = mr.doctor_id
    JOIN users u ON u.id = d.user_id
    WHERE mr.patient_id = ?
    ORDER BY mr.record_date DESC
  `).all(patient.id);

  res.json({ success: true, records });
});

module.exports = router;
