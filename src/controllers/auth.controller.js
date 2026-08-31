import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";
import { mapCustomer } from "../lib/mappers.js";

// ---- Admin (email + password) ----

export async function adminLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const { rows } = await pool.query(
    "SELECT * FROM admin_users WHERE email = $1",
    [String(email).trim().toLowerCase()],
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.json({ token, admin: { id: user.id, email: user.email, name: user.name } });
}

export async function adminChangePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters" });
  }
  const { rows } = await pool.query("SELECT * FROM admin_users WHERE id = $1", [
    req.admin.sub,
  ]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
    return res.status(400).json({ error: "Current password is incorrect" });
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await pool.query("UPDATE admin_users SET password_hash = $1 WHERE id = $2", [
    passwordHash,
    user.id,
  ]);
  res.json({ ok: true });
}

// ---- Customer (phone + OTP) ----

function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function requestOtp(req, res) {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone is required" });
  const code = genOtp();
  const expiresAt = new Date(Date.now() + 5 * 60_000);
  await pool.query(
    `INSERT INTO otp_codes (phone, code, expires_at) VALUES ($1, $2, $3)
     ON CONFLICT (phone) DO UPDATE SET code = $2, expires_at = $3`,
    [phone, code, expiresAt],
  );
  // No SMS gateway wired up yet — log it, and return it in the response so the
  // demo is actually usable by real visitors, not just developers with server access.
  console.log(`[otp] ${phone} -> ${code}`);
  res.json({ ok: true, demoCode: code });
}

export async function verifyOtp(req, res) {
  const { phone, code } = req.body;
  if (!phone || !code) return res.status(400).json({ error: "Phone and code are required" });

  const { rows } = await pool.query("SELECT * FROM otp_codes WHERE phone = $1", [phone]);
  const record = rows[0];
  if (!record || record.code !== String(code).trim() || record.expires_at < new Date()) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }
  await pool.query("DELETE FROM otp_codes WHERE phone = $1", [phone]);

  const existing = await pool.query("SELECT * FROM customers WHERE phone = $1", [phone]);
  let customer = existing.rows[0];
  if (!customer) {
    const inserted = await pool.query(
      `INSERT INTO customers (phone, first_name, last_name) VALUES ($1, 'LMB', 'Customer')
       RETURNING *`,
      [phone],
    );
    customer = inserted.rows[0];
  }

  const token = jwt.sign({ sub: customer.id, phone: customer.phone }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  res.json({ token, customer: mapCustomer(customer) });
}

export async function me(req, res) {
  const { rows } = await pool.query("SELECT * FROM customers WHERE id = $1", [
    req.customer.sub,
  ]);
  if (!rows[0]) return res.status(404).json({ error: "Customer not found" });
  res.json(mapCustomer(rows[0]));
}
