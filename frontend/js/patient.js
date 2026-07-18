// js/patient.js
// Drives the Patient Dashboard: browsing doctors, booking appointments,
// viewing appointment history, medical records, and editing profile.

const user = requireRole("patient");
document.getElementById("welcomeMsg").textContent = `Hi, ${user.name}`;

let selectedDoctorId = null;

function switchTab(tab) {
  document.querySelectorAll(".tab-content").forEach(el => el.style.display = "none");
  document.querySelectorAll(".tabs button").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tab));
  document.getElementById(`tab-${tab}`).style.display = "block";
  if (tab === "book") loadDoctors();
  if (tab === "appointments") loadAppointments();
  if (tab === "records") loadRecords();
  if (tab === "profile") loadProfile();
}

async function loadDoctors() {
  const container = document.getElementById("doctorList");
  container.innerHTML = "Loading...";
  try {
    const { doctors } = await apiRequest("/patients/doctors");
    if (!doctors.length) {
      container.innerHTML = `<div class="empty-state">No doctors available right now.</div>`;
      return;
    }
    container.innerHTML = doctors.map(d => `
      <div class="card">
        <h3>${d.name}</h3>
        <p style="color:var(--muted);margin:4px 0;">${d.specialization} &middot; ${d.experience_years || 0} yrs experience</p>
        <p style="color:var(--muted);margin-bottom:12px;">Fee: ₹${d.fees || 0} &middot; Available: ${d.available_days}</p>
        <button class="btn small" onclick="openBookModal(${d.doctor_id}, '${d.name.replace(/'/g, "")}')">Book Appointment</button>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = `<div class="alert error">${err.message}</div>`;
  }
}

function openBookModal(doctorId, name) {
  selectedDoctorId = doctorId;
  document.getElementById("bookDoctorName").textContent = `with Dr. ${name}`;
  document.getElementById("bookAlert").innerHTML = "";
  document.getElementById("bookModal").style.display = "flex";
}
function closeBookModal() {
  document.getElementById("bookModal").style.display = "none";
}

async function confirmBooking(e) {
  e.preventDefault();
  const appointment_date = document.getElementById("bookDate").value;
  const appointment_time = document.getElementById("bookTime").value;
  const reason = document.getElementById("bookReason").value;
  try {
    await apiRequest("/appointments", {
      method: "POST",
      body: { doctor_id: selectedDoctorId, appointment_date, appointment_time, reason }
    });
    closeBookModal();
    switchTab("appointments");
  } catch (err) {
    document.getElementById("bookAlert").innerHTML = `<div class="alert error">${err.message}</div>`;
  }
  return false;
}

async function loadAppointments() {
  const tbody = document.getElementById("appointmentsTable");
  const empty = document.getElementById("appointmentsEmpty");
  tbody.innerHTML = "";
  try {
    const { appointments } = await apiRequest("/appointments/my");
    empty.style.display = appointments.length ? "none" : "block";
    tbody.innerHTML = appointments.map(a => `
      <tr>
        <td>Dr. ${a.doctor_name}</td>
        <td>${a.specialization}</td>
        <td>${a.appointment_date}</td>
        <td>${a.appointment_time}</td>
        <td><span class="badge ${a.status}">${a.status}</span></td>
        <td>${a.status === "pending" || a.status === "confirmed"
              ? `<button class="btn small danger" onclick="cancelAppointment(${a.id})">Cancel</button>`
              : "-"}</td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="alert error">${err.message}</div></td></tr>`;
  }
}

async function cancelAppointment(id) {
  if (!confirm("Cancel this appointment?")) return;
  try {
    await apiRequest(`/appointments/${id}`, { method: "DELETE" });
    loadAppointments();
  } catch (err) {
    alert(err.message);
  }
}

async function loadRecords() {
  const tbody = document.getElementById("recordsTable");
  const empty = document.getElementById("recordsEmpty");
  try {
    const { records } = await apiRequest("/patients/medical-records");
    empty.style.display = records.length ? "none" : "block";
    tbody.innerHTML = records.map(r => `
      <tr>
        <td>${new Date(r.record_date).toLocaleDateString()}</td>
        <td>Dr. ${r.doctor_name} (${r.specialization})</td>
        <td>${r.diagnosis || "-"}</td>
        <td>${r.prescription || "-"}</td>
        <td>${r.notes || "-"}</td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="alert error">${err.message}</div></td></tr>`;
  }
}

async function loadProfile() {
  try {
    const { profile } = await apiRequest("/patients/profile");
    document.getElementById("pName").value = profile.name;
    document.getElementById("pEmail").value = profile.email;
    document.getElementById("pPhone").value = profile.phone || "";
    document.getElementById("pDob").value = profile.dob || "";
    document.getElementById("pGender").value = profile.gender || "";
    document.getElementById("pBloodGroup").value = profile.blood_group || "";
    document.getElementById("pAddress").value = profile.address || "";
  } catch (err) {
    document.getElementById("profileAlert").innerHTML = `<div class="alert error">${err.message}</div>`;
  }
}

async function saveProfile(e) {
  e.preventDefault();
  try {
    await apiRequest("/patients/profile", {
      method: "PUT",
      body: {
        phone: document.getElementById("pPhone").value,
        dob: document.getElementById("pDob").value,
        gender: document.getElementById("pGender").value,
        blood_group: document.getElementById("pBloodGroup").value,
        address: document.getElementById("pAddress").value
      }
    });
    document.getElementById("profileAlert").innerHTML = `<div class="alert success">Profile updated successfully.</div>`;
  } catch (err) {
    document.getElementById("profileAlert").innerHTML = `<div class="alert error">${err.message}</div>`;
  }
  return false;
}

// initial load
loadDoctors();
