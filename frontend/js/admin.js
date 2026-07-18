// js/admin.js
// Drives the Admin Dashboard: reports, and management of doctors,
// patients, and appointments.

const user = requireRole("admin");
document.getElementById("welcomeMsg").textContent = `Admin: ${user.name}`;

function switchTab(tab) {
  document.querySelectorAll(".tab-content").forEach(el => el.style.display = "none");
  document.querySelectorAll(".tabs button").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tab));
  document.getElementById(`tab-${tab}`).style.display = "block";
  if (tab === "doctors") loadDoctors();
  if (tab === "patients") loadPatients();
  if (tab === "appointments") loadAppointments();
}

async function loadReports() {
  try {
    const { report } = await apiRequest("/admin/reports");
    document.getElementById("statGrid").innerHTML = `
      <div class="stat-card"><div class="value">${report.totalPatients}</div><div class="label">Total Patients</div></div>
      <div class="stat-card"><div class="value">${report.totalDoctors}</div><div class="label">Total Doctors</div></div>
      <div class="stat-card"><div class="value">${report.totalAppointments}</div><div class="label">Total Appointments</div></div>
      <div class="stat-card"><div class="value">${report.upcoming}</div><div class="label">Upcoming Appointments</div></div>
    `;
  } catch (err) {
    document.getElementById("statGrid").innerHTML = `<div class="alert error">${err.message}</div>`;
  }
}

async function loadDoctors() {
  const tbody = document.getElementById("doctorsTable");
  const empty = document.getElementById("doctorsEmpty");
  try {
    const { doctors } = await apiRequest("/admin/doctors");
    empty.style.display = doctors.length ? "none" : "block";
    tbody.innerHTML = doctors.map(d => `
      <tr>
        <td>${d.name}</td>
        <td>${d.email}</td>
        <td>${d.specialization}</td>
        <td>${d.experience_years || 0} yrs</td>
        <td>₹${d.fees || 0}</td>
        <td><button class="btn small danger" onclick="removeDoctor(${d.doctor_id})">Remove</button></td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="alert error">${err.message}</div></td></tr>`;
  }
}

async function removeDoctor(id) {
  if (!confirm("Remove this doctor?")) return;
  try {
    await apiRequest(`/admin/doctors/${id}`, { method: "DELETE" });
    loadDoctors();
    loadReports();
  } catch (err) { alert(err.message); }
}

function openDoctorModal() {
  document.getElementById("doctorAlert").innerHTML = "";
  document.getElementById("doctorModal").style.display = "flex";
}
function closeDoctorModal() {
  document.getElementById("doctorModal").style.display = "none";
}

async function submitDoctor(e) {
  e.preventDefault();
  try {
    await apiRequest("/admin/doctors", {
      method: "POST",
      body: {
        name: document.getElementById("newDocName").value,
        email: document.getElementById("newDocEmail").value,
        password: document.getElementById("newDocPassword").value,
        phone: document.getElementById("newDocPhone").value,
        specialization: document.getElementById("newDocSpecialization").value,
        experience_years: Number(document.getElementById("newDocExperience").value) || 0,
        fees: Number(document.getElementById("newDocFees").value) || 0
      }
    });
    closeDoctorModal();
    loadDoctors();
    loadReports();
  } catch (err) {
    document.getElementById("doctorAlert").innerHTML = `<div class="alert error">${err.message}</div>`;
  }
  return false;
}

async function loadPatients() {
  const tbody = document.getElementById("patientsTable");
  const empty = document.getElementById("patientsEmpty");
  try {
    const { patients } = await apiRequest("/admin/patients");
    empty.style.display = patients.length ? "none" : "block";
    tbody.innerHTML = patients.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>${p.email}</td>
        <td>${p.phone || "-"}</td>
        <td>${p.gender || "-"}</td>
        <td><button class="btn small danger" onclick="removePatient(${p.patient_id})">Remove</button></td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="alert error">${err.message}</div></td></tr>`;
  }
}

async function removePatient(id) {
  if (!confirm("Remove this patient?")) return;
  try {
    await apiRequest(`/admin/patients/${id}`, { method: "DELETE" });
    loadPatients();
    loadReports();
  } catch (err) { alert(err.message); }
}

async function loadAppointments() {
  const tbody = document.getElementById("appointmentsTable");
  const empty = document.getElementById("appointmentsEmpty");
  try {
    const { appointments } = await apiRequest("/admin/appointments");
    empty.style.display = appointments.length ? "none" : "block";
    tbody.innerHTML = appointments.map(a => `
      <tr>
        <td>${a.patient_name}</td>
        <td>${a.doctor_name}</td>
        <td>${a.specialization}</td>
        <td>${a.appointment_date}</td>
        <td>${a.appointment_time}</td>
        <td><span class="badge ${a.status}">${a.status}</span></td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="alert error">${err.message}</div></td></tr>`;
  }
}

loadReports();
loadDoctors();
