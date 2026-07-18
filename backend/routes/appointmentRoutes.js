// routes/appointmentRoutes.js
// Appointment Booking & Tracking - used by patients to book/view, and doctors to update status.

const express = require("express");
const db = require("../config/db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

function getPatientIdByUser(userId) {
  const row = db.prepare("SELECT id FROM patients WHERE user_id = ?").get(userId);
  return row ? row.id : null;
}
function getDoctorIdByUser(userId) {
  const row = db.prepare("SELECT id FROM doctors WHERE user_id = ?").get(userId);
  return row ? row.id : null;
}

// @route POST /api/appointments  (patient books an appointment)
router.post("/", authorize("patient"), (req, res) => {
  const { doctor_id, appointment_date, appointment_time, reason } = req.body;
  if (!doctor_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ success: false, message: "doctor_id, appointment_date and appointment_time are required." });
  }

  const patientId = getPatientIdByUser(req.user.id);
  if (!patientId) return res.status(404).json({ success: false, message: "Patient profile not found." });

  const doctor = db.prepare("SELECT id FROM doctors WHERE id = ?").get(doctor_id);
  if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found." });

  const result = db.prepare(`
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(patientId, doctor_id, appointment_date, appointment_time, reason || null);

  res.status(201).json({ success: true, message: "Appointment booked successfully.", appointment_id: result.lastInsertRowid });
});

// @route GET /api/appointments/my  (patient: own appointments | doctor: own appointments)
router.get("/my", (req, res) => {
  if (req.user.role === "patient") {
    const patientId = getPatientIdByUser(req.user.id);
    const rows = db.prepare(`
      SELECT a.id, a.appointment_date, a.appointment_time, a.reason, a.status,
             u.name AS doctor_name, d.specialization
      FROM appointments a
      JOIN doctors d ON d.id = a.doctor_id
      JOIN users u ON u.id = d.user_id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `).all(patientId);
    return res.json({ success: true, appointments: rows });
  }

  if (req.user.role === "doctor") {
    const doctorId = getDoctorIdByUser(req.user.id);
    const rows = db.prepare(`
      SELECT a.id, a.appointment_date, a.appointment_time, a.reason, a.status,
             u.name AS patient_name, u.phone AS patient_phone, a.patient_id
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      JOIN users u ON u.id = p.user_id
      WHERE a.doctor_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `).all(doctorId);
    return res.json({ success: true, appointments: rows });
  }

  return res.status(403).json({ success: false, message: "Not permitted." });
});

// @route PUT /api/appointments/:id/status  (doctor updates status: confirmed/completed/cancelled)
router.put("/:id/status", authorize("doctor"), (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "confirmed", "completed", "cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(", ")}` });
  }

  const doctorId = getDoctorIdByUser(req.user.id);
  const appointment = db.prepare("SELECT * FROM appointments WHERE id = ? AND doctor_id = ?").get(req.params.id, doctorId);
  if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found." });

  db.prepare("UPDATE appointments SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ success: true, message: "Appointment status updated." });
});

// @route DELETE /api/appointments/:id  (patient cancels own pending appointment)
router.delete("/:id", authorize("patient"), (req, res) => {
  const patientId = getPatientIdByUser(req.user.id);
  const appointment = db.prepare("SELECT * FROM appointments WHERE id = ? AND patient_id = ?").get(req.params.id, patientId);
  if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found." });

  db.prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?").run(req.params.id);
  res.json({ success: true, message: "Appointment cancelled." });
});

module.exports = router;
