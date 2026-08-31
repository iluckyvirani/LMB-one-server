import { pool } from "../db/pool.js";
import { mapOrder } from "../lib/mappers.js";

function newOrderId() {
  const n = Math.floor(1_000_000 + Math.random() * 8_999_999);
  return `LMB-${n}`;
}

async function loadOrderWithItems(id) {
  const orderRes = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
  if (!orderRes.rows[0]) return null;
  const itemsRes = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [id]);
  return mapOrder(orderRes.rows[0], itemsRes.rows);
}

// POST /api/orders — checkout, used by website. Body: { items:[{productId,size,qty}], address, paymentMethod }
export async function createOrder(req, res) {
  const { items, address, paymentMethod } = req.body;
  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: "items are required" });
  }
  if (!address?.fullName || !address?.phone || !address?.addressLine1) {
    return res.status(400).json({ error: "A valid address is required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const resolvedItems = [];
    let subtotal = 0;
    for (const item of items) {
      const { rows } = await client.query("SELECT * FROM products WHERE id = $1 FOR UPDATE", [
        item.productId,
      ]);
      const product = rows[0];
      if (!product) throw new HttpError(400, `Product ${item.productId} not found`);
      if (product.stock < item.qty) {
        throw new HttpError(400, `${product.title} is out of stock`);
      }
      subtotal += Number(product.price) * item.qty;
      resolvedItems.push({ product, qty: item.qty, size: item.size });
    }

    const settingsRes = await client.query("SELECT * FROM store_settings WHERE id = 1");
    const settings = settingsRes.rows[0];
    const freeShippingThreshold = settings ? Number(settings.free_shipping_threshold) : 0;
    const shippingFee = settings ? Number(settings.shipping_fee) : 0;
    const shipping =
      freeShippingThreshold > 0 && subtotal < freeShippingThreshold ? shippingFee : 0;
    const total = subtotal + shipping;

    const method = paymentMethod ?? "cod";
    if (method === "cod" && settings) {
      if (!settings.cod_enabled) {
        throw new HttpError(400, "Cash on Delivery is currently unavailable");
      }
      if (total > Number(settings.cod_max_amount)) {
        throw new HttpError(
          400,
          `Cash on Delivery is not available for orders above ₹${settings.cod_max_amount}`,
        );
      }
    }

    const customerId = req.customer?.sub ?? null;
    const id = newOrderId();
    const orderRes = await client.query(
      `INSERT INTO orders (
        id, customer_id, customer_name, customer_phone, address_line1, city, state, pincode,
        payment_method, subtotal, shipping, total
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [
        id,
        customerId,
        address.fullName,
        address.phone,
        address.addressLine1,
        address.city,
        address.state,
        address.pincode,
        method,
        subtotal,
        shipping,
        total,
      ],
    );

    for (const { product, qty, size } of resolvedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, title, slug, price, qty, size, swatch_from, swatch_to, image)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          id,
          product.id,
          product.title,
          product.slug,
          product.price,
          qty,
          size,
          product.swatch_from,
          product.swatch_to,
          product.image,
        ],
      );
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [
        qty,
        product.id,
      ]);
    }

    await client.query(
      `INSERT INTO shipments (order_id, status) VALUES ($1, 'not_shipped')
       ON CONFLICT (order_id) DO NOTHING`,
      [id],
    );

    await client.query("COMMIT");
    const itemsRes = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [id]);
    res.status(201).json(mapOrder(orderRes.rows[0], itemsRes.rows));
  } catch (err) {
    await client.query("ROLLBACK");
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    throw err;
  } finally {
    client.release();
  }
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// GET /api/admin/orders?status=&q= — admin list, powers OrdersPage/OrderBoardPage
export async function listOrders(req, res) {
  const { status, q } = req.query;
  const clauses = [];
  const params = [];
  if (status) {
    params.push(status);
    clauses.push(`status = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    clauses.push(`(id ILIKE $${params.length} OR customer_name ILIKE $${params.length} OR customer_phone ILIKE $${params.length})`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM orders ${where} ORDER BY created_at DESC`,
    params,
  );

  const ids = rows.map((r) => r.id);
  const itemsByOrder = new Map();
  if (ids.length) {
    const itemsRes = await pool.query(
      "SELECT * FROM order_items WHERE order_id = ANY($1)",
      [ids],
    );
    for (const item of itemsRes.rows) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }
  }
  res.json(rows.map((r) => mapOrder(r, itemsByOrder.get(r.id) ?? [])));
}

// GET /api/admin/orders/:id
export async function getOrderAdmin(req, res) {
  const order = await loadOrderWithItems(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
}

// PATCH /api/admin/orders/:id/status — OrderDetailPage / OrderBoardPage
export async function updateOrderStatus(req, res) {
  const { status } = req.body;
  const { rows } = await pool.query(
    "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
    [status, req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ error: "Order not found" });
  const order = await loadOrderWithItems(req.params.id);
  res.json(order);
}

// GET /api/customer/orders — website order history
export async function listMyOrders(req, res) {
  const { rows } = await pool.query(
    "SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC",
    [req.customer.sub],
  );
  const ids = rows.map((r) => r.id);
  const itemsByOrder = new Map();
  if (ids.length) {
    const itemsRes = await pool.query(
      "SELECT * FROM order_items WHERE order_id = ANY($1)",
      [ids],
    );
    for (const item of itemsRes.rows) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }
  }
  res.json(rows.map((r) => mapOrder(r, itemsByOrder.get(r.id) ?? [])));
}

// GET /api/customer/orders/:id — website order detail/tracking, scoped to the logged-in customer
export async function getMyOrder(req, res) {
  const { rows } = await pool.query(
    "SELECT * FROM orders WHERE id = $1 AND customer_id = $2",
    [req.params.id, req.customer.sub],
  );
  if (!rows[0]) return res.status(404).json({ error: "Order not found" });
  const order = await loadOrderWithItems(req.params.id);
  res.json(order);
}
