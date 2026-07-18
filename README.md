# HealthBridge — Healthcare Management Platform

**Internship Project** | Full Stack Developer Track
**Intern:** Shyanu Rajput | **Assigned by:** CountryEdu Private Limited
**Duration:** 10 Days

## Overview

HealthBridge is a full-stack healthcare management web application that connects
patients with doctors through a single platform. Patients can register, browse
doctors, book appointments, and view their medical history. Doctors can manage
their appointment schedule and update patient records. Admins get an overview
of the whole platform and manage doctors, patients, and appointments.

This is a Minimum Viable Product (MVP) built with plain, dependable technology
so every part of the stack is easy to read, run, and explain.

## Technology Stack

| Layer          | Technology                                   |
|----------------|-----------------------------------------------|
| Frontend       | HTML5, CSS3, Vanilla JavaScript (fetch API)   |
| Backend        | Node.js, Express.js                           |
| Database       | SQLite (via `better-sqlite3`)                 |
| Authentication | JSON Web Tokens (JWT) + bcrypt password hashing|
| API Style      | RESTful JSON APIs                             |

> Why SQLite? It requires zero external setup — the whole database lives in a
> single file (`backend/healthbridge.db`) that is created automatically the
> first time the server runs. That makes the project trivial for anyone to
> clone and run locally or on a low-cost host, while still using real SQL,
> foreign keys, and relational integrity.

## Project Structure

```
healthbridge/
├── backend/
│   ├── config/db.js            # DB connection + schema + admin seed
│   ├── middleware/auth.js      # JWT auth + role-based access control
│   ├── routes/
│   │   ├── authRoutes.js       # Register / Login / Me
│   │   ├── patientRoutes.js    # Patient profile, doctor list, records
│   │   ├── doctorRoutes.js     # Doctor profile, patients, records
│   │   ├── adminRoutes.js      # Reports, manage doctors/patients
│   │   └── appointmentRoutes.js# Book / view / update / cancel
│   ├── server.js               # App entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html              # Landing + login/register
│   ├── patient.html / js/patient.js
│   ├── doctor.html   / js/doctor.js
│   ├── admin.html    / js/admin.js
│   ├── css/style.css
│   └── js/api.js               # Shared fetch/session helper
├── docs/
│   ├── API_DOCUMENTATION.md
│   └── DATABASE_SCHEMA.md
└── README.md
```

## Modules Implemented

- **Patient Module** — Registration, Login, Dashboard, Book Appointments, View Medical Records, Appointment History, Profile
- **Doctor Module** — Login, Dashboard, Manage Appointments, Update Patient Records, Profile
- **Admin Module** — Login, Dashboard, Manage Doctors, Manage Patients, Manage Appointments, View Reports
- **Authentication Module** — Registration, Login, Logout, Role-Based Access Control (JWT)
- **Database Module** — Patient, Doctor, Appointment, Medical Record, and User data (SQLite)
- **API Module** — RESTful endpoints for every module above
- **Frontend Module** — Responsive UI, dashboards, patient portal

## Getting Started

### Prerequisites
- Node.js v18 or higher
- npm

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
# then edit .env and set a strong JWT_SECRET
```

### 3. Run the server
```bash
npm start
# or, for auto-reload during development:
npm run dev
```

The server starts at **http://localhost:5000** and also serves the frontend,
so you can open that URL directly in your browser — no separate frontend
server is required.

On first run, the app automatically creates `healthbridge.db` and seeds a
default admin account:

```
Email:    admin@healthbridge.com
Password: Admin@123
```

> Change this password (or delete/replace the seed) before any real deployment.

### 4. Try it out
1. Open `http://localhost:5000`
2. Register as a **Patient** (or a **Doctor**)
3. Log in as the seeded **Admin** in a separate browser/incognito tab to see
   the admin dashboard and reports
4. As a patient, browse doctors and book an appointment
5. As a doctor, confirm/complete the appointment and add a medical record
6. As the patient again, check the "Medical Records" tab

## Deployment Notes

Because the whole app is a single Node/Express process serving both the API
and static frontend files, it can be deployed as-is to any Node-friendly host
(Render, Railway, Fly.io, a VPS, etc.). Set the `JWT_SECRET` environment
variable on the host and the SQLite file will be created automatically on
first boot. For production, consider mounting a persistent disk/volume for
`healthbridge.db` so data survives redeploys.

## Security Notes

- Passwords are hashed with bcrypt before storage — plaintext passwords are never saved.
- All patient/doctor/admin routes are protected by JWT authentication and role-based authorization middleware.
- Foreign key constraints and cascading deletes keep the relational data consistent.

## Author

Built by **Shyanu Rajput** as part of the HealthBridge Internship Project
assigned by CountryEdu Private Limited (IT Managed Services & EdTech Solutions).
