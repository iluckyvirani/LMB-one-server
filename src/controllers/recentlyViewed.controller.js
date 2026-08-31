import { pool } from "../db/pool.js";
import { mapProduct } from "../lib/mappers.js";

const MAX_ITEMS = 8;

// GET /api/customer/recently-viewed
export async function listMyRecentlyViewed(req, res) {
  const { rows } = await pool.query(
    `SELECT p.* FROM recently_viewed r
     JOIN products p ON p.id = r.product_id
     WHERE r.customer_id = $1
     ORDER BY r.viewed_at DESC
     LIMIT $2`,
    [req.customer.sub, MAX_ITEMS],
  );
  res.json(rows.map(mapProduct));
}

// POST /api/customer/recently-viewed — body: { productId }
export async function recordMyView(req, res) {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "productId is required" });
  await pool.query(
    `INSERT INTO recently_viewed (customer_id, product_id, viewed_at)
     VALUES ($1, $2, now())
     ON CONFLICT (customer_id, product_id) DO UPDATE SET viewed_at = now()`,
    [req.customer.sub, productId],
  );
  res.status(201).json({ ok: true });
}
