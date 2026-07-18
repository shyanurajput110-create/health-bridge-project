// js/api.js
// Small fetch wrapper shared by every page. Handles the JWT auth header
// and centralizes error handling so each page's script stays simple.

const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("hb_token");
}
function getUser() {
  const raw = localStorage.getItem("hb_user");
  return raw ? JSON.parse(raw) : null;
}
function saveSession(token, user) {
  localStorage.setItem("hb_token", token);
  localStorage.setItem("hb_user", JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem("hb_token");
  localStorage.removeItem("hb_user");
}
function logout() {
  clearSession();
  window.location.href = "index.html";
}
function requireRole(role) {
  const user = getUser();
  if (!user || !getToken() || user.role !== role) {
    window.location.href = "index.html";
  }
  return user;
}

async function apiRequest(path, { method = "GET", body = null, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }
  return data;
}
