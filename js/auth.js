// js/auth.js
// Logic for the landing page: toggling login/register forms and
// handling authentication requests.

let selectedRole = "patient";

function showForm(which) {
  document.getElementById("loginForm").style.display = which === "login" ? "block" : "none";
  document.getElementById("registerForm").style.display = which === "register" ? "block" : "none";
}

function setRole(role) {
  selectedRole = role;
  document.getElementById("roleBtnPatient").classList.toggle("active", role === "patient");
  document.getElementById("roleBtnDoctor").classList.toggle("active", role === "doctor");
  document.getElementById("specializationGroup").style.display = role === "doctor" ? "block" : "none";
  document.getElementById("genderGroup").style.display = role === "patient" ? "block" : "none";
}

function redirectByRole(role) {
  if (role === "patient") window.location.href = "patient.html";
  else if (role === "doctor") window.location.href = "doctor.html";
  else if (role === "admin") window.location.href = "admin.html";
}

function showAlert(elId, message, type = "error") {
  const el = document.getElementById(elId);
  el.innerHTML = `<div class="alert ${type}">${message}</div>`;
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const data = await apiRequest("/auth/login", { method: "POST", body: { email, password }, auth: false });
    saveSession(data.token, data.user);
    redirectByRole(data.user.role);
  } catch (err) {
    showAlert("loginAlert", err.message);
  }
  return false;
}

async function handleRegister(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById("regName").value.trim(),
    email: document.getElementById("regEmail").value.trim(),
    phone: document.getElementById("regPhone").value.trim(),
    password: document.getElementById("regPassword").value,
    role: selectedRole,
    specialization: document.getElementById("regSpecialization").value.trim(),
    gender: document.getElementById("regGender").value
  };

  try {
    const data = await apiRequest("/auth/register", { method: "POST", body: payload, auth: false });
    saveSession(data.token, data.user);
    redirectByRole(data.user.role);
  } catch (err) {
    showAlert("registerAlert", err.message);
  }
  return false;
}

// If already logged in, skip straight to the right dashboard.
(function autoRedirect() {
  const user = getUser();
  if (user && getToken()) redirectByRole(user.role);
})();
