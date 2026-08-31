import bcrypt from "bcryptjs";
import { pool } from "./pool.js";

const ADMIN_EMAIL = "admin@lmbshoes.com";
const ADMIN_PASSWORD = "admin123";

const SAMPLE_PRODUCTS = [
  {
    id: "p-seed-1",
    slug: "heritage-oxford-tan",
    title: "Heritage Oxford — Tan",
    category: "men",
    style: "formal",
    collection: "LMB Heritage",
    tags: ["bestseller", "daily-wear"],
    price: 6999,
    mrp: 8999,
    rating: 4.5,
    reviewsCount: 128,
    stock: 42,
    sizes: [7, 8, 9, 10, 11],
    colorway: "Tan Brown",
    color: "Tan",
    colorHex: "#a5673f",
    swatch: ["#c99b6a", "#7a4a26"],
    description: "Hand-finished leather oxfords built for all-day formal wear.",
    image:
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop",
    ],
  },
  {
    id: "p-seed-2",
    slug: "edition-stiletto-noir",
    title: "Édition Stiletto — Noir",
    category: "women",
    style: "heels",
    collection: "LMB Édition",
    tags: ["new-arrival", "party-wear"],
    price: 5499,
    mrp: 6999,
    rating: 4.7,
    reviewsCount: 64,
    stock: 25,
    sizes: [5, 6, 7, 8],
    colorway: "Noir",
    color: "Black",
    colorHex: "#111111",
    swatch: ["#2a2a2a", "#000000"],
    description: "A sculpted stiletto silhouette in supple noir leather.",
    image:
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop",
    ],
  },
  {
    id: "p-seed-3",
    slug: "sport-runner-blaze",
    title: "Sport Runner — Blaze",
    category: "sports",
    style: "sports",
    collection: "LMB Sport",
    tags: ["bestseller"],
    price: 4299,
    mrp: 4999,
    rating: 4.3,
    reviewsCount: 210,
    stock: 80,
    sizes: [6, 7, 8, 9, 10],
    colorway: "Blaze Orange",
    color: "Orange",
    colorHex: "#e85d2c",
    swatch: ["#ff8552", "#c8431b"],
    description: "Lightweight performance runner with responsive cushioning.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
    ],
  },
];

async function seed() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await pool.query(
    `INSERT INTO admin_users (email, password_hash, name)
     VALUES ($1, $2, 'Admin')
     ON CONFLICT (email) DO NOTHING`,
    [ADMIN_EMAIL, passwordHash],
  );

  for (const p of SAMPLE_PRODUCTS) {
    await pool.query(
      `INSERT INTO products (
        id, slug, title, category, style, collection, tags, price, mrp,
        rating, reviews_count, stock, sizes, colorway, color, color_hex,
        swatch_from, swatch_to, description, image, images
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
      )
      ON CONFLICT (id) DO NOTHING`,
      [
        p.id,
        p.slug,
        p.title,
        p.category,
        p.style,
        p.collection,
        p.tags,
        p.price,
        p.mrp,
        p.rating,
        p.reviewsCount,
        p.stock,
        p.sizes,
        p.colorway,
        p.color,
        p.colorHex,
        p.swatch[0],
        p.swatch[1],
        p.description,
        p.image,
        p.images,
      ],
    );
  }

  console.log(`Seed complete. Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
