import { pool } from "../db/pool.js";
import { mapContactMessage } from "../lib/mappers.js";

// POST /api/contact — public, website contact form
export async function submitContactMessage(req, res) {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim();
  const message = req.body.message?.trim();
  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email and message are required" });
  }
  const { rows } = await pool.query(
    "INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3) RETURNING *",
    [name, email, message],
  );
  res.status(201).json(mapContactMessage(rows[0]));
}

// GET /api/admin/contact-messages
export async function listContactMessages(_req, res) {
  const { rows } = await pool.query(
    "SELECT * FROM contact_messages ORDER BY created_at DESC",
  );
  res.json(rows.map(mapContactMessage));
}

// DELETE /api/admin/contact-messages/:id
export async function removeContactMessage(req, res) {
  const { rowCount } = await pool.query("DELETE FROM contact_messages WHERE id = $1", [
    req.params.id,
  ]);
  if (!rowCount) return res.status(404).json({ error: "Message not found" });
  res.status(204).end();
}
