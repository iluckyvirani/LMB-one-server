import { pool } from "../db/pool.js";
import { mapProduct } from "../lib/mappers.js";

// GET /api/customer/cart
export async function listMyCart(req, res) {
  const { rows } = await pool.query(
    `SELECT p.*, c.size, c.qty FROM cart_items c
     JOIN products p ON p.id = c.product_id
     WHERE c.customer_id = $1
     ORDER BY c.updated_at DESC`,
    [req.customer.sub],
  );
  res.json(rows.map((r) => ({ product: mapProduct(r), size: r.size, qty: r.qty })));
}

// POST /api/customer/cart — body: { productId, size, qty }. Adds to existing qty if the line exists.
export async function addToMyCart(req, res) {
  const { productId, size, qty } = req.body;
  if (!productId || !size || !qty) {
    return res.status(400).json({ error: "productId, size and qty are required" });
  }
  await pool.query(
    `INSERT INTO cart_items (customer_id, product_id, size, qty)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (customer_id, product_id, size)
     DO UPDATE SET qty = cart_items.qty + EXCLUDED.qty, updated_at = now()`,
    [req.customer.sub, productId, Number(size), Number(qty)],
  );
  res.status(201).json({ ok: true });
}

// PUT /api/customer/cart/:productId/:size — body: { qty } (sets an absolute quantity)
export async function setMyCartItemQty(req, res) {
  const qty = Number(req.body.qty);
  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ error: "qty must be a positive integer" });
  }
  await pool.query(
    `UPDATE cart_items SET qty = $1, updated_at = now()
     WHERE customer_id = $2 AND product_id = $3 AND size = $4`,
    [qty, req.customer.sub, req.params.productId, Number(req.params.size)],
  );
  res.status(204).end();
}

// DELETE /api/customer/cart/:productId/:size
export async function removeMyCartItem(req, res) {
  await pool.query(
    "DELETE FROM cart_items WHERE customer_id = $1 AND product_id = $2 AND size = $3",
    [req.customer.sub, req.params.productId, Number(req.params.size)],
  );
  res.status(204).end();
}

// DELETE /api/customer/cart — clears the whole cart (used right after placing an order)
export async function clearMyCart(req, res) {
  await pool.query("DELETE FROM cart_items WHERE customer_id = $1", [req.customer.sub]);
  res.status(204).end();
}
