// js/doctor.js
// Drives the Doctor Dashboard: managing appointments, viewing patients,
// adding medical records, and editing profile.

const user = requireRole("doctor");
document.getElementById("welcomeMsg").textContent = `Dr. ${user.name}`;

let selectedPatientId = null;

function switchTab(tab) {
  document.querySelectorAll(".tab-content").forEach(el => el.style.display = "none");
  document.querySelectorAll(".tabs button").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tab));
  document.getElementById(`tab-${tab}`).style.display = "block";
  if (tab === "appointments") loadAppointments();
  if (tab === "patients") loadPatients();
  if (tab === "profile") loadProfile();
}

async function loadAppointments() {
  const tbody = document.getElementById("apptTable");
  const empty = document.getElementById("apptEmpty");
  try {
    const { appointments } = await apiRequest("/appointments/my");
    empty.style.display = appointments.length ? "none" : "block";
    tbody.innerHTML = appointments.map(a => `
      <tr>
        <td>${a.patient_name}</td>
        <td>${a.patient_phone || "-"}</td>
        <td>${a.appointment_date}</td>
        <td>${a.appointment_time}</td>
        <td>${a.reason || "-"}</td>
        <td><span class="badge ${a.status}">${a.status}</span></td>
        <td>
          <select onchange="updateStatus(${a.id}, this.value)" style="padding:4px;border-radius:6px;">
            <option value="">Change</option>
            <option value="confirmed">Confirm</option>
            <option value="completed">Complete</option>
            <option value="cancelled">Cancel</option>
          </select>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="alert error">${err.message}</div></td></tr>`;
  }
}

async function updateStatus(id, status) {
  if (!status) return;
  try {
    await apiRequest(`/appointments/${id}/status`, { method: "PUT", body: { status } });
    loadAppointments();
  } catch (err) {
    alert(err.message);
  }
}

async function loadPatients() {
  const tbody = document.getElementById("patientsTable");
  const empty = document.getElementById("patientsEmpty");
  try {
    const { patients } = await apiRequest("/doctors/patients");
    empty.style.display = patients.length ? "none" : "block";
    tbody.innerHTML = patients.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>${p.email}</td>
        <td>${p.phone || "-"}</td>
        <td>${p.gender || "-"}</td>
        <td>${p.blood_group || "-"}</td>
        <td><button class="btn small" onclick="openRecordModal(${p.patient_id}, '${p.name.replace(/'/g, "")}')">Add Record</button></td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="alert error">${err.message}</div></td></tr>`;
  }
}

function openRecordModal(patientId, name) {
  selectedPatientId = patientId;
  document.getElementById("recordPatientName").textContent = `for ${name}`;
  document.getElementById("recordAlert").innerHTML = "";
  document.getElementById("recordModal").style.display = "flex";
}
function closeRecordModal() {
  document.getElementById("recordModal").style.display = "none";
}

async function submitRecord(e) {
  e.preventDefault();
  try {
    await apiRequest("/doctors/medical-records", {
      method: "POST",
      body: {
        patient_id: selectedPatientId,
        diagnosis: document.getElementById("recDiagnosis").value,
        prescription: document.getElementById("recPrescription").value,
        notes: document.getElementById("recNotes").value
      }
    });
    closeRecordModal();
  } catch (err) {
    document.getElementById("recordAlert").innerHTML = `<div class="alert error">${err.message}</div>`;
  }
  return false;
}

async function loadProfile() {
  try {
    const { profile } = await apiRequest("/doctors/profile");
    document.getElementById("dName").value = profile.name;
    document.getElementById("dEmail").value = profile.email;
    document.getElementById("dPhone").value = profile.phone || "";
    document.getElementById("dSpecialization").value = profile.specialization || "";
    document.getElementById("dExperience").value = profile.experience_years || 0;
    document.getElementById("dFees").value = profile.fees || 0;
    document.getElementById("dAvailableDays").value = profile.available_days || "Mon-Sat";
  } catch (err) {
    document.getElementById("profileAlert").innerHTML = `<div class="alert error">${err.message}</div>`;
  }
}

async function saveProfile(e) {
  e.preventDefault();
  try {
    await apiRequest("/doctors/profile", {
      method: "PUT",
      body: {
        phone: document.getElementById("dPhone").value,
        specialization: document.getElementById("dSpecialization").value,
        experience_years: Number(document.getElementById("dExperience").value) || 0,
        fees: Number(document.getElementById("dFees").value) || 0,
        available_days: document.getElementById("dAvailableDays").value
      }
    });
    document.getElementById("profileAlert").innerHTML = `<div class="alert success">Profile updated successfully.</div>`;
  } catch (err) {
    document.getElementById("profileAlert").innerHTML = `<div class="alert error">${err.message}</div>`;
  }
  return false;
}

loadAppointments();
