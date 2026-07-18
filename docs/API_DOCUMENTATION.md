# HealthBridge — API Documentation

Base URL (local): `http://localhost:5000/api`

All request/response bodies are JSON. Protected routes require an
`Authorization: Bearer <token>` header, where `<token>` is the JWT returned
by login or registration.

---

## Authentication Module

### Register
`POST /auth/register`

| Field | Type | Required | Notes |
|---|---|---|---|
| name | string | yes | |
| email | string | yes | must be unique |
| password | string | yes | min 6 characters |
| phone | string | no | |
| role | string | yes | `patient` or `doctor` |
| specialization | string | doctor only | |
| dob, gender | string | patient only | |

**Response `201`**
```json
{ "success": true, "token": "...", "user": { "id": 1, "name": "...", "email": "...", "role": "patient" } }
```

### Login
`POST /auth/login`
```json
{ "email": "user@example.com", "password": "secret" }
```
**Response `200`** — same shape as register.

### Current user
`GET /auth/me` *(auth required)*

---

## Patient Module *(role: patient)*

| Method | Route | Description |
|---|---|---|
| GET | `/patients/profile` | Get own profile |
| PUT | `/patients/profile` | Update phone, dob, gender, address, blood group |
| GET | `/patients/doctors` | List all doctors available for booking |
| GET | `/patients/medical-records` | View own medical records |

---

## Doctor Module *(role: doctor)*

| Method | Route | Description |
|---|---|---|
| GET | `/doctors/profile` | Get own profile |
| PUT | `/doctors/profile` | Update specialization, experience, fee, availability |
| GET | `/doctors/patients` | List patients who have booked with this doctor |
| POST | `/doctors/medical-records` | Add a medical record for a patient |
| GET | `/doctors/medical-records/:patientId` | View records this doctor wrote for a patient |

`POST /doctors/medical-records` body:
```json
{ "patient_id": 1, "appointment_id": 4, "diagnosis": "...", "prescription": "...", "notes": "..." }
```

---

## Appointment Module *(role: patient or doctor)*

| Method | Route | Role | Description |
|---|---|---|---|
| POST | `/appointments` | patient | Book an appointment |
| GET | `/appointments/my` | both | List own appointments |
| PUT | `/appointments/:id/status` | doctor | Update status: `pending`/`confirmed`/`completed`/`cancelled` |
| DELETE | `/appointments/:id` | patient | Cancel own appointment |

`POST /appointments` body:
```json
{ "doctor_id": 1, "appointment_date": "2026-08-01", "appointment_time": "10:30", "reason": "Fever" }
```

---

## Admin Module *(role: admin)*

| Method | Route | Description |
|---|---|---|
| GET | `/admin/reports` | Dashboard summary (counts, status breakdown) |
| GET | `/admin/doctors` | List all doctors |
| POST | `/admin/doctors` | Create a new doctor account |
| DELETE | `/admin/doctors/:id` | Remove a doctor |
| GET | `/admin/patients` | List all patients |
| DELETE | `/admin/patients/:id` | Remove a patient |
| GET | `/admin/appointments` | List all appointments platform-wide |

---

## Standard Error Response

```json
{ "success": false, "message": "Human-readable error message." }
```

| Status | Meaning |
|---|---|
| 400 | Validation error / missing fields |
| 401 | Invalid credentials or missing token |
| 403 | Token invalid/expired, or role not permitted |
| 404 | Resource not found |
| 409 | Conflict (e.g., email already registered) |
| 500 | Server error |
