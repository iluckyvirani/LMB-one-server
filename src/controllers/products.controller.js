import { pool } from "../db/pool.js";
import { mapProduct } from "../lib/mappers.js";
import { uploadBuffer } from "../lib/cloudinary.js";

function newId() {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET /api/products — public listing with filters, used by website shop/search
export async function listProducts(req, res) {
  const { category, style, collection, tag, q, sort, limit, offset } = req.query;
  const clauses = [];
  const params = [];

  if (category) {
    params.push(category);
    clauses.push(`category = $${params.length}`);
  }
  if (style) {
    params.push(style);
    clauses.push(`style = $${params.length}`);
  }
  if (collection) {
    params.push(collection);
    clauses.push(`collection = $${params.length}`);
  }
  if (tag) {
    params.push(tag);
    clauses.push(`$${params.length} = ANY(tags)`);
  }
  if (q) {
    params.push(`%${q}%`);
    clauses.push(`title ILIKE $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const orderBy =
    {
      "price-asc": "price ASC",
      "price-desc": "price DESC",
      newest: "created_at DESC",
      rating: "rating DESC",
    }[sort] ?? "created_at DESC";

  const lim = Math.min(Number(limit) || 60, 200);
  const off = Number(offset) || 0;
  params.push(lim, off);

  const { rows } = await pool.query(
    `SELECT * FROM products ${where} ORDER BY ${orderBy} LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  res.json(rows.map(mapProduct));
}

// GET /api/products/:idOrSlug — public detail, matches by id or slug
export async function getProduct(req, res) {
  const { idOrSlug } = req.params;
  const { rows } = await pool.query(
    "SELECT * FROM products WHERE id = $1 OR slug = $1",
    [idOrSlug],
  );
  if (!rows[0]) return res.status(404).json({ error: "Product not found" });
  res.json(mapProduct(rows[0]));
}

// POST /api/admin/products
export async function createProduct(req, res) {
  const b = req.body;
  if (!b.title || !b.category || !b.style || !b.collection) {
    return res.status(400).json({ error: "title, category, style, collection are required" });
  }
  const id = newId();
  const slug = b.slug?.trim() || slugify(b.title);
  const swatch = b.swatch ?? [null, null];

  const { rows } = await pool.query(
    `INSERT INTO products (
      id, slug, title, category, style, collection, tags, price, mrp,
      rating, reviews_count, stock, sizes, colorway, color, color_hex,
      swatch_from, swatch_to, description, image, images
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
    RETURNING *`,
    [
      id,
      slug,
      b.title,
      b.category,
      b.style,
      b.collection,
      b.tags ?? [],
      b.price ?? 0,
      b.mrp ?? 0,
      b.rating ?? 0,
      b.reviewsCount ?? 0,
      b.stock ?? 0,
      b.sizes ?? [],
      b.colorway ?? null,
      b.color ?? null,
      b.colorHex ?? null,
      swatch[0] ?? null,
      swatch[1] ?? null,
      b.description ?? null,
      b.image ?? null,
      b.images ?? [],
    ],
  );
  res.status(201).json(mapProduct(rows[0]));
}

// PUT /api/admin/products/:id
export async function updateProduct(req, res) {
  const { id } = req.params;
  const b = req.body;
  const swatch = b.swatch;

  const fields = {
    slug: b.slug,
    title: b.title,
    category: b.category,
    style: b.style,
    collection: b.collection,
    tags: b.tags,
    price: b.price,
    mrp: b.mrp,
    rating: b.rating,
    reviews_count: b.reviewsCount,
    stock: b.stock,
    sizes: b.sizes,
    colorway: b.colorway,
    color: b.color,
    color_hex: b.colorHex,
    swatch_from: swatch?.[0],
    swatch_to: swatch?.[1],
    description: b.description,
    image: b.image,
    images: b.images,
  };

  const set = [];
  const params = [];
  for (const [col, val] of Object.entries(fields)) {
    if (val === undefined) continue;
    params.push(val);
    set.push(`${col} = $${params.length}`);
  }
  if (!set.length) return res.status(400).json({ error: "No fields to update" });

  set.push("updated_at = now()");
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE products SET ${set.join(", ")} WHERE id = $${params.length} RETURNING *`,
    params,
  );
  if (!rows[0]) return res.status(404).json({ error: "Product not found" });
  res.json(mapProduct(rows[0]));
}

// DELETE /api/admin/products/:id
export async function removeProduct(req, res) {
  const { rowCount } = await pool.query("DELETE FROM products WHERE id = $1", [
    req.params.id,
  ]);
  if (!rowCount) return res.status(404).json({ error: "Product not found" });
  res.status(204).end();
}

// POST /api/admin/products/upload-image — multipart "image" field
export async function uploadProductImage(req, res) {
  if (!req.file) return res.status(400).json({ error: "No image file provided" });
  const result = await uploadBuffer(req.file.buffer);
  res.json({ url: result.secure_url, publicId: result.public_id });
}
