import { pool } from "../db/pool.js";
import { mapBanner, mapTestimonial, mapTrustItem, mapBankOffer } from "../lib/mappers.js";

// ---- Banners ----

// GET /api/banners — public, active only
export async function listBanners(_req, res) {
  const { rows } = await pool.query(
    "SELECT * FROM banners WHERE active = true ORDER BY position ASC, id ASC",
  );
  res.json(rows.map(mapBanner));
}

// GET /api/admin/banners — admin, all rows
export async function listBannersAdmin(_req, res) {
  const { rows } = await pool.query("SELECT * FROM banners ORDER BY position ASC, id ASC");
  res.json(rows.map(mapBanner));
}

// POST /api/admin/banners
export async function createBanner(req, res) {
  const b = req.body;
  if (!b.title) return res.status(400).json({ error: "title is required" });
  const swatch = b.swatch ?? ["#1a1a1a", "#3a3a3a"];
  const { rows } = await pool.query(
    `INSERT INTO banners (href, image, swatch_from, swatch_to, badge, eyebrow, title, subtitle, cta, position, active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [
      b.href ?? "/shop",
      b.image ?? null,
      swatch[0],
      swatch[1],
      b.badge ?? "",
      b.eyebrow ?? "",
      b.title,
      b.subtitle ?? "",
      b.cta ?? "Shop Now",
      b.position ?? 0,
      b.active ?? true,
    ],
  );
  res.status(201).json(mapBanner(rows[0]));
}

// PUT /api/admin/banners/:id
export async function updateBanner(req, res) {
  const b = req.body;
  const swatch = b.swatch;
  const fields = {
    href: b.href,
    image: b.image,
    swatch_from: swatch?.[0],
    swatch_to: swatch?.[1],
    badge: b.badge,
    eyebrow: b.eyebrow,
    title: b.title,
    subtitle: b.subtitle,
    cta: b.cta,
    position: b.position,
    active: b.active,
  };
  const set = [];
  const params = [];
  for (const [col, val] of Object.entries(fields)) {
    if (val === undefined) continue;
    params.push(val);
    set.push(`${col} = $${params.length}`);
  }
  if (!set.length) return res.status(400).json({ error: "No fields to update" });
  params.push(req.params.id);
  const { rows } = await pool.query(
    `UPDATE banners SET ${set.join(", ")} WHERE id = $${params.length} RETURNING *`,
    params,
  );
  if (!rows[0]) return res.status(404).json({ error: "Banner not found" });
  res.json(mapBanner(rows[0]));
}

// DELETE /api/admin/banners/:id
export async function deleteBanner(req, res) {
  const { rowCount } = await pool.query("DELETE FROM banners WHERE id = $1", [req.params.id]);
  if (!rowCount) return res.status(404).json({ error: "Banner not found" });
  res.status(204).end();
}

// ---- Testimonials ----

export async function listTestimonials(_req, res) {
  const { rows } = await pool.query(
    "SELECT * FROM testimonials WHERE active = true ORDER BY position ASC, id ASC",
  );
  res.json(rows.map(mapTestimonial));
}

export async function listTestimonialsAdmin(_req, res) {
  const { rows } = await pool.query("SELECT * FROM testimonials ORDER BY position ASC, id ASC");
  res.json(rows.map(mapTestimonial));
}

export async function createTestimonial(req, res) {
  const b = req.body;
  if (!b.name || !b.text) return res.status(400).json({ error: "name and text are required" });
  const { rows } = await pool.query(
    `INSERT INTO testimonials (name, location, rating, text, position, active)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [b.name, b.location ?? "", b.rating ?? 5, b.text, b.position ?? 0, b.active ?? true],
  );
  res.status(201).json(mapTestimonial(rows[0]));
}

export async function updateTestimonial(req, res) {
  const b = req.body;
  const fields = {
    name: b.name,
    location: b.location,
    rating: b.rating,
    text: b.text,
    position: b.position,
    active: b.active,
  };
  const set = [];
  const params = [];
  for (const [col, val] of Object.entries(fields)) {
    if (val === undefined) continue;
    params.push(val);
    set.push(`${col} = $${params.length}`);
  }
  if (!set.length) return res.status(400).json({ error: "No fields to update" });
  params.push(req.params.id);
  const { rows } = await pool.query(
    `UPDATE testimonials SET ${set.join(", ")} WHERE id = $${params.length} RETURNING *`,
    params,
  );
  if (!rows[0]) return res.status(404).json({ error: "Testimonial not found" });
  res.json(mapTestimonial(rows[0]));
}

export async function deleteTestimonial(req, res) {
  const { rowCount } = await pool.query("DELETE FROM testimonials WHERE id = $1", [
    req.params.id,
  ]);
  if (!rowCount) return res.status(404).json({ error: "Testimonial not found" });
  res.status(204).end();
}

// ---- Trust strip items ----

export async function listTrustItems(_req, res) {
  const { rows } = await pool.query(
    "SELECT * FROM trust_items WHERE active = true ORDER BY position ASC, id ASC",
  );
  res.json(rows.map(mapTrustItem));
}

export async function listTrustItemsAdmin(_req, res) {
  const { rows } = await pool.query("SELECT * FROM trust_items ORDER BY position ASC, id ASC");
  res.json(rows.map(mapTrustItem));
}

export async function createTrustItem(req, res) {
  const b = req.body;
  if (!b.label) return res.status(400).json({ error: "label is required" });
  const { rows } = await pool.query(
    `INSERT INTO trust_items (icon, label, description, position, active)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [b.icon ?? "truck", b.label, b.description ?? "", b.position ?? 0, b.active ?? true],
  );
  res.status(201).json(mapTrustItem(rows[0]));
}

export async function updateTrustItem(req, res) {
  const b = req.body;
  const fields = {
    icon: b.icon,
    label: b.label,
    description: b.description,
    position: b.position,
    active: b.active,
  };
  const set = [];
  const params = [];
  for (const [col, val] of Object.entries(fields)) {
    if (val === undefined) continue;
    params.push(val);
    set.push(`${col} = $${params.length}`);
  }
  if (!set.length) return res.status(400).json({ error: "No fields to update" });
  params.push(req.params.id);
  const { rows } = await pool.query(
    `UPDATE trust_items SET ${set.join(", ")} WHERE id = $${params.length} RETURNING *`,
    params,
  );
  if (!rows[0]) return res.status(404).json({ error: "Trust item not found" });
  res.json(mapTrustItem(rows[0]));
}

export async function deleteTrustItem(req, res) {
  const { rowCount } = await pool.query("DELETE FROM trust_items WHERE id = $1", [
    req.params.id,
  ]);
  if (!rowCount) return res.status(404).json({ error: "Trust item not found" });
  res.status(204).end();
}

// ---- Bank offers ----

export async function listBankOffers(_req, res) {
  const { rows } = await pool.query(
    "SELECT * FROM bank_offers WHERE active = true ORDER BY position ASC, id ASC",
  );
  res.json(rows.map(mapBankOffer));
}

export async function listBankOffersAdmin(_req, res) {
  const { rows } = await pool.query("SELECT * FROM bank_offers ORDER BY position ASC, id ASC");
  res.json(rows.map(mapBankOffer));
}

export async function createBankOffer(req, res) {
  const b = req.body;
  if (!b.title) return res.status(400).json({ error: "title is required" });
  const { rows } = await pool.query(
    `INSERT INTO bank_offers (title, detail, position, active) VALUES ($1,$2,$3,$4) RETURNING *`,
    [b.title, b.detail ?? "", b.position ?? 0, b.active ?? true],
  );
  res.status(201).json(mapBankOffer(rows[0]));
}

export async function updateBankOffer(req, res) {
  const b = req.body;
  const fields = { title: b.title, detail: b.detail, position: b.position, active: b.active };
  const set = [];
  const params = [];
  for (const [col, val] of Object.entries(fields)) {
    if (val === undefined) continue;
    params.push(val);
    set.push(`${col} = $${params.length}`);
  }
  if (!set.length) return res.status(400).json({ error: "No fields to update" });
  params.push(req.params.id);
  const { rows } = await pool.query(
    `UPDATE bank_offers SET ${set.join(", ")} WHERE id = $${params.length} RETURNING *`,
    params,
  );
  if (!rows[0]) return res.status(404).json({ error: "Bank offer not found" });
  res.json(mapBankOffer(rows[0]));
}

export async function deleteBankOffer(req, res) {
  const { rowCount } = await pool.query("DELETE FROM bank_offers WHERE id = $1", [
    req.params.id,
  ]);
  if (!rowCount) return res.status(404).json({ error: "Bank offer not found" });
  res.status(204).end();
}
