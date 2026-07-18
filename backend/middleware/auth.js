// middleware/auth.js
// Handles authentication (JWT verification) and role-based authorization.

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "healthbridge_dev_secret_change_me";

function authenticate(req, res, next) {
  const header = req.headers["authorization"];
  const token = header && header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, name, email }
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid or expired token." });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "You do not have permission to perform this action." });
    }
    next();
  };
}

module.exports = { authenticate, authorize, JWT_SECRET };
