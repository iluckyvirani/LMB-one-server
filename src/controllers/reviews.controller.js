import { pool } from "../db/pool.js";
import { mapReview } from "../lib/mappers.js";

// GET /api/products/:productId/reviews — public
export async function listProductReviews(req, res) {
  const { rows } = await pool.query(
    `SELECT r.*, c.first_name, c.last_name FROM reviews r
     JOIN customers c ON c.id = r.customer_id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC`,
    [req.params.productId],
  );
  const reviews = rows.map(mapReview);
  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));
  res.json({ reviews, breakdown });
}

// POST /api/customer/products/:productId/reviews — auth required, verified-purchase only.
// Body: { rating, text }
export async function createReview(req, res) {
  const { productId } = req.params;
  const rating = Number(req.body.rating);
  const text = req.body.text?.trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
  }
  if (!text) return res.status(400).json({ error: "Review text is required" });

  const customerId = req.customer.sub;
  const purchase = await pool.query(
    `SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE o.customer_id = $1 AND oi.product_id = $2 LIMIT 1`,
    [customerId, productId],
  );
  if (!purchase.rows.length) {
    return res.status(403).json({ error: "You can only review products you've purchased" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO reviews (product_id, customer_id, rating, text)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [productId, customerId, rating, text],
    );
    const { rows: customerRows } = await pool.query(
      "SELECT first_name, last_name FROM customers WHERE id = $1",
      [customerId],
    );
    res.status(201).json(mapReview({ ...rows[0], ...customerRows[0] }));
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "You've already reviewed this product" });
    }
    throw err;
  }
}
