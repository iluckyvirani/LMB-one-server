import { pool } from "../db/pool.js";
import { mapShipment } from "../lib/mappers.js";

function newAwb(courier) {
  const prefix = courier.slice(0, 2).toUpperCase();
  const num = Math.floor(100000000 + Math.random() * 899999999);
  return `${prefix}${num}`;
}

// GET /api/admin/shipments — ShippingPage
export async function listShipments(req, res) {
  const { rows } = await pool.query(
    `SELECT s.*, o.customer_name, o.city, o.state, o.pincode
     FROM shipments s JOIN orders o ON o.id = s.order_id
     ORDER BY s.last_update DESC`,
  );
  res.json(
    rows.map((r) => ({
      ...mapShipment(r),
      customerName: r.customer_name,
      city: r.city,
      state: r.state,
      pincode: r.pincode,
    })),
  );
}

// GET /api/admin/shipments/:orderId
export async function getShipment(req, res) {
  const { rows } = await pool.query("SELECT * FROM shipments WHERE order_id = $1", [
    req.params.orderId,
  ]);
  if (!rows[0]) return res.status(404).json({ error: "Shipment not found" });
  res.json(mapShipment(rows[0]));
}

// POST /api/admin/shipments/:orderId/assign-awb — body: { courier }
export async function assignAwb(req, res) {
  const { courier } = req.body;
  if (!courier) return res.status(400).json({ error: "courier is required" });
  const awbCode = newAwb(courier);
  const { rows } = await pool.query(
    `INSERT INTO shipments (order_id, courier, awb_code, status, last_update)
     VALUES ($1, $2, $3, 'awb_assigned', now())
     ON CONFLICT (order_id) DO UPDATE
       SET courier = $2, awb_code = $3, status = 'awb_assigned', last_update = now()
     RETURNING *`,
    [req.params.orderId, courier, awbCode],
  );
  res.json(mapShipment(rows[0]));
}

// PATCH /api/admin/shipments/:orderId/status
export async function updateShipmentStatus(req, res) {
  const { status } = req.body;
  const { rows } = await pool.query(
    `UPDATE shipments SET status = $1, last_update = now() WHERE order_id = $2 RETURNING *`,
    [status, req.params.orderId],
  );
  if (!rows[0]) return res.status(404).json({ error: "Shipment not found" });
  res.json(mapShipment(rows[0]));
}

// GET /api/customer/orders/:id/shipment — website order tracking
export async function getShipmentForCustomer(req, res) {
  const orderRes = await pool.query(
    "SELECT id FROM orders WHERE id = $1 AND customer_id = $2",
    [req.params.id, req.customer.sub],
  );
  if (!orderRes.rows[0]) return res.status(404).json({ error: "Order not found" });
  const { rows } = await pool.query("SELECT * FROM shipments WHERE order_id = $1", [
    req.params.id,
  ]);
  res.json(rows[0] ? mapShipment(rows[0]) : null);
}
