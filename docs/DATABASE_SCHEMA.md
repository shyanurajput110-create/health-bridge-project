# HealthBridge — Database Schema

Engine: **SQLite** (file: `backend/healthbridge.db`, created automatically on first run)

## Entity Relationship Summary

```
users (1) ── (1) patients
users (1) ── (1) doctors
patients (1) ── (many) appointments
doctors  (1) ── (many) appointments
patients (1) ── (many) medical_records
doctors  (1) ── (many) medical_records
appointments (1) ── (0..1) medical_records
```

## Tables

### users
| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL |
| email | TEXT | NOT NULL, UNIQUE |
| password | TEXT | NOT NULL (bcrypt hash) |
| phone | TEXT | |
| role | TEXT | NOT NULL, CHECK IN ('patient','doctor','admin') |
| created_at | TEXT | DEFAULT current timestamp |

### patients
| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| user_id | INTEGER | NOT NULL, UNIQUE, FK → users(id) ON DELETE CASCADE |
| dob | TEXT | |
| gender | TEXT | |
| address | TEXT | |
| blood_group | TEXT | |

### doctors
| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| user_id | INTEGER | NOT NULL, UNIQUE, FK → users(id) ON DELETE CASCADE |
| specialization | TEXT | NOT NULL |
| experience_years | INTEGER | DEFAULT 0 |
| fees | REAL | DEFAULT 0 |
| available_days | TEXT | DEFAULT 'Mon-Sat' |

### appointments
| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| patient_id | INTEGER | NOT NULL, FK → patients(id) ON DELETE CASCADE |
| doctor_id | INTEGER | NOT NULL, FK → doctors(id) ON DELETE CASCADE |
| appointment_date | TEXT | NOT NULL |
| appointment_time | TEXT | NOT NULL |
| reason | TEXT | |
| status | TEXT | NOT NULL, DEFAULT 'pending', CHECK IN ('pending','confirmed','completed','cancelled') |
| created_at | TEXT | DEFAULT current timestamp |

### medical_records
| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| patient_id | INTEGER | NOT NULL, FK → patients(id) ON DELETE CASCADE |
| doctor_id | INTEGER | NOT NULL, FK → doctors(id) ON DELETE CASCADE |
| appointment_id | INTEGER | FK → appointments(id) ON DELETE SET NULL |
| diagnosis | TEXT | |
| prescription | TEXT | |
| notes | TEXT | |
| record_date | TEXT | DEFAULT current timestamp |

## Design Notes

- Each `users` row is linked to exactly one `patients` **or** one `doctors`
  row (never both), enforced at the application layer during registration.
- `ON DELETE CASCADE` on `patients`/`doctors` means deleting a `users` row
  automatically cleans up its role-specific profile, appointments, and
  medical records — used by the Admin "remove doctor/patient" actions.
- `appointment_id` on `medical_records` is optional (`ON DELETE SET NULL`)
  since a doctor may add a record independent of a specific appointment.
