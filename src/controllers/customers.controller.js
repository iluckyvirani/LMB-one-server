import { pool } from "../db/pool.js";
import { mapCustomer, mapAddress } from "../lib/mappers.js";

const CUSTOMER_WITH_STATS = `
  SELECT c.*,
    COUNT(o.id) FILTER (WHERE o.id IS NOT NULL) AS orders_count,
    COALESCE(SUM(o.total) FILTER (WHERE o.status <> 'cancelled'), 0) AS total_spent
  FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id
`;

// GET /api/admin/customers — CustomersPage
export async function listCustomers(req, res) {
  const { q } = req.query;
  const params = [];
  let where = "";
  if (q) {
    params.push(`%${q}%`);
    where = `WHERE c.name ILIKE $1 OR c.email ILIKE $1 OR c.phone ILIKE $1`;
  }
  const { rows } = await pool.query(
    `${CUSTOMER_WITH_STATS} ${where} GROUP BY c.id ORDER BY c.joined_at DESC`,
    params,
  );
  res.json(rows.map(mapCustomer));
}

// GET /api/admin/customers/:id — CustomerDetailPage
export async function getCustomerAdmin(req, res) {
  const { rows } = await pool.query(`${CUSTOMER_WITH_STATS} WHERE c.id = $1 GROUP BY c.id`, [
    req.params.id,
  ]);
  if (!rows[0]) return res.status(404).json({ error: "Customer not found" });
  res.json(mapCustomer(rows[0]));
}

// PATCH /api/admin/customers/:id
export async function updateCustomerAdmin(req, res) {
  const { firstName, lastName, email, phone } = req.body;
  const { rows } = await pool.query(
    `UPDATE customers SET
      first_name = COALESCE($1, first_name),
      last_name = COALESCE($2, last_name),
      email = COALESCE($3, email),
      phone = COALESCE($4, phone)
     WHERE id = $5 RETURNING *`,
    [firstName, lastName, email, phone, req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ error: "Customer not found" });
  res.json(mapCustomer(rows[0]));
}

// PATCH /api/admin/customers/:id/block
export async function setCustomerBlocked(req, res) {
  const { blocked } = req.body;
  const { rows } = await pool.query(
    "UPDATE customers SET blocked = $1 WHERE id = $2 RETURNING *",
    [!!blocked, req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ error: "Customer not found" });
  res.json(mapCustomer(rows[0]));
}

// DELETE /api/admin/customers/:id
export async function removeCustomer(req, res) {
  const { rowCount } = await pool.query("DELETE FROM customers WHERE id = $1", [
    req.params.id,
  ]);
  if (!rowCount) return res.status(404).json({ error: "Customer not found" });
  res.status(204).end();
}

// ---- Customer-facing (website account pages) ----

// GET /api/customer/profile
export async function getMyProfile(req, res) {
  const { rows } = await pool.query("SELECT * FROM customers WHERE id = $1", [
    req.customer.sub,
  ]);
  if (!rows[0]) return res.status(404).json({ error: "Customer not found" });
  res.json(mapCustomer(rows[0]));
}

// PUT /api/customer/profile
export async function updateMyProfile(req, res) {
  const { firstName, lastName, email, phone } = req.body;
  const { rows } = await pool.query(
    `UPDATE customers SET
      first_name = COALESCE($1, first_name),
      last_name = COALESCE($2, last_name),
      email = COALESCE($3, email),
      phone = COALESCE($4, phone)
     WHERE id = $5 RETURNING *`,
    [firstName, lastName, email, phone, req.customer.sub],
  );
  res.json(mapCustomer(rows[0]));
}

// GET /api/customer/addresses
export async function listMyAddresses(req, res) {
  const { rows } = await pool.query(
    "SELECT * FROM addresses WHERE customer_id = $1 ORDER BY is_default DESC, created_at DESC",
    [req.customer.sub],
  );
  res.json(rows.map(mapAddress));
}

// POST /api/customer/addresses
export async function createMyAddress(req, res) {
  const { fullName, phone, addressLine1, city, state, pincode, label, isDefault } = req.body;
  if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
    return res.status(400).json({ error: "All address fields are required" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (isDefault) {
      await client.query("UPDATE addresses SET is_default = false WHERE customer_id = $1", [
        req.customer.sub,
      ]);
    }
    const { rows } = await client.query(
      `INSERT INTO addresses (customer_id, full_name, phone, address_line1, city, state, pincode, label, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        req.customer.sub,
        fullName,
        phone,
        addressLine1,
        city,
        state,
        pincode,
        label ?? "Home",
        !!isDefault,
      ],
    );
    await client.query("COMMIT");
    res.status(201).json(mapAddress(rows[0]));
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// PUT /api/customer/addresses/:id
export async function updateMyAddress(req, res) {
  const { fullName, phone, addressLine1, city, state, pincode, label, isDefault } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (isDefault) {
      await client.query("UPDATE addresses SET is_default = false WHERE customer_id = $1", [
        req.customer.sub,
      ]);
    }
    const { rows } = await client.query(
      `UPDATE addresses SET
        full_name = COALESCE($1, full_name),
        phone = COALESCE($2, phone),
        address_line1 = COALESCE($3, address_line1),
        city = COALESCE($4, city),
        state = COALESCE($5, state),
        pincode = COALESCE($6, pincode),
        label = COALESCE($7, label),
        is_default = COALESCE($8, is_default)
       WHERE id = $9 AND customer_id = $10 RETURNING *`,
      [
        fullName,
        phone,
        addressLine1,
        city,
        state,
        pincode,
        label,
        isDefault,
        req.params.id,
        req.customer.sub,
      ],
    );
    await client.query("COMMIT");
    if (!rows[0]) return res.status(404).json({ error: "Address not found" });
    res.json(mapAddress(rows[0]));
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// DELETE /api/customer/addresses/:id
export async function removeMyAddress(req, res) {
  const { rowCount } = await pool.query(
    "DELETE FROM addresses WHERE id = $1 AND customer_id = $2",
    [req.params.id, req.customer.sub],
  );
  if (!rowCount) return res.status(404).json({ error: "Address not found" });
  res.status(204).end();
}
