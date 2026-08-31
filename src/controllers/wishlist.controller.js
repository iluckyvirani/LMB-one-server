import { pool } from "../db/pool.js";
import { mapProduct } from "../lib/mappers.js";

// GET /api/customer/wishlist
export async function listMyWishlist(req, res) {
  const { rows } = await pool.query(
    `SELECT p.* FROM wishlist_items w
     JOIN products p ON p.id = w.product_id
     WHERE w.customer_id = $1
     ORDER BY w.created_at DESC`,
    [req.customer.sub],
  );
  res.json(rows.map(mapProduct));
}

// POST /api/customer/wishlist — body: { productId }
export async function addToMyWishlist(req, res) {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: "productId is required" });
  await pool.query(
    `INSERT INTO wishlist_items (customer_id, product_id) VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [req.customer.sub, productId],
  );
  res.status(201).json({ ok: true });
}

// DELETE /api/customer/wishlist/:productId
export async function removeFromMyWishlist(req, res) {
  await pool.query(
    "DELETE FROM wishlist_items WHERE customer_id = $1 AND product_id = $2",
    [req.customer.sub, req.params.productId],
  );
  res.status(204).end();
}
