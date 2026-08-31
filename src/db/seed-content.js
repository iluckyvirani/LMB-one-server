// Seeds banners/testimonials/trust_items/bank_offers with the content that was previously
// hardcoded in the website's components, so switching those components over to the API
// doesn't leave the home page blank.
import { pool } from "./pool.js";

const BANNERS = [
  {
    href: "/shop?tag=new-arrival",
    image: "/banners/hero-luxury-oxford.jpg",
    swatch: ["#1a1a1a", "#3a3a3a"],
    badge: "Heritage Collection",
    eyebrow: "New Arrivals 2026",
    title: "Handcrafted Luxury Leather, Made For The Modern Connoisseur",
    subtitle: "Artisanal silhouettes cut from full-grain calfskin — special introductory prices.",
    cta: "Explore Collection",
  },
  {
    href: "/shop?tag=party-wear",
    image: "/banners/hero-party-heels.jpg",
    swatch: ["#5c1a2b", "#c9a227"],
    badge: "The Gala Édition",
    eyebrow: "Party & Evening Wear",
    title: "Velvet Elegance & Gilded Heels For The Grand Night",
    subtitle: "Turn heads with handcrafted stilettos, smoking loafers & embellished party sandals.",
    cta: "Shop Evening Edit",
  },
  {
    href: "/shop?category=sports",
    image: "/banners/hero-sports-runner.jpg",
    swatch: ["#103524", "#0df2c9"],
    badge: "Performance Lab",
    eyebrow: "Limitless Momentum",
    title: "CloudStep & Nitro Series — Engineered For Speed",
    subtitle: "Ultra-responsive dynamic cushioning and breathable mesh for effortless strides.",
    cta: "Discover Sports",
  },
  {
    href: "/shop?category=kids",
    image: "/banners/hero-kids-sneakers.jpg",
    swatch: ["#3f6fb0", "#e0556a"],
    badge: "Little Feet",
    eyebrow: "Youth & Toddlers",
    title: "Playful Steps & Bold Cushioning For Young Explorers",
    subtitle: "Durable, featherlight, and non-slip trainers designed for active all-day fun.",
    cta: "Shop Kids Collection",
  },
  {
    href: "/shop",
    image: "/banners/hero-season-sale.jpg",
    swatch: ["#2d1b0e", "#c9a227"],
    badge: "Limited Season Event",
    eyebrow: "Artisan Craftsmanship",
    title: "Flat 25% Off Iconic Goodyear-Welted Footwear",
    subtitle: "Unmatched durability meets timeless British & Italian bespoke craftsmanship.",
    cta: "Claim Your Discount",
  },
];

const TESTIMONIALS = [
  {
    name: "Ananya R.",
    location: "Delhi",
    rating: 5,
    text: "The Aurora Heel is the most comfortable pair I've worn to a wedding. True to size and the packaging felt genuinely premium.",
  },
  {
    name: "Karan M.",
    location: "Bengaluru",
    rating: 5,
    text: "Ordered the Regal Oxford for work — the leather quality is way above what I expected at this price. Delivery was quick too.",
  },
  {
    name: "Priya S.",
    location: "Mumbai",
    rating: 4,
    text: "CloudStep Runners are now my daily gym pair. Great cushioning, and the customer support was helpful when I had a sizing question.",
  },
];

const TRUST_ITEMS = [
  { icon: "truck", label: "Free Shipping", description: "On every order, no minimum" },
  { icon: "rotate-ccw", label: "7-Day Returns", description: "Easy exchanges & refunds" },
  { icon: "banknote", label: "Cash on Delivery", description: "Pay when it arrives" },
  { icon: "shield-check", label: "Secure Checkout", description: "Your details stay safe" },
];

const BANK_OFFERS = [
  {
    title: "10% Instant Discount on HDFC Bank Credit Card",
    detail: "Min Spend ₹3,500, Max Discount ₹1,200",
  },
  {
    title: "10% Instant Discount on Kotak Bank Credit Card EMI",
    detail: "Min Spend ₹3,500, Max Discount ₹1,000",
  },
  {
    title: "Flat 5% Cashback on LMB-One Shoes Store Card",
    detail: "On a minimum spend of ₹1,000",
  },
];

async function seedContent() {
  const { rows: existingBanners } = await pool.query("SELECT id FROM banners LIMIT 1");
  if (!existingBanners.length) {
    for (let i = 0; i < BANNERS.length; i++) {
      const b = BANNERS[i];
      await pool.query(
        `INSERT INTO banners (href, image, swatch_from, swatch_to, badge, eyebrow, title, subtitle, cta, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [b.href, b.image, b.swatch[0], b.swatch[1], b.badge, b.eyebrow, b.title, b.subtitle, b.cta, i],
      );
    }
    console.log(`Seeded ${BANNERS.length} banners.`);
  }

  const { rows: existingTestimonials } = await pool.query("SELECT id FROM testimonials LIMIT 1");
  if (!existingTestimonials.length) {
    for (let i = 0; i < TESTIMONIALS.length; i++) {
      const t = TESTIMONIALS[i];
      await pool.query(
        `INSERT INTO testimonials (name, location, rating, text, position) VALUES ($1,$2,$3,$4,$5)`,
        [t.name, t.location, t.rating, t.text, i],
      );
    }
    console.log(`Seeded ${TESTIMONIALS.length} testimonials.`);
  }

  const { rows: existingTrustItems } = await pool.query("SELECT id FROM trust_items LIMIT 1");
  if (!existingTrustItems.length) {
    for (let i = 0; i < TRUST_ITEMS.length; i++) {
      const t = TRUST_ITEMS[i];
      await pool.query(
        `INSERT INTO trust_items (icon, label, description, position) VALUES ($1,$2,$3,$4)`,
        [t.icon, t.label, t.description, i],
      );
    }
    console.log(`Seeded ${TRUST_ITEMS.length} trust items.`);
  }

  const { rows: existingBankOffers } = await pool.query("SELECT id FROM bank_offers LIMIT 1");
  if (!existingBankOffers.length) {
    for (let i = 0; i < BANK_OFFERS.length; i++) {
      const o = BANK_OFFERS[i];
      await pool.query(
        `INSERT INTO bank_offers (title, detail, position) VALUES ($1,$2,$3)`,
        [o.title, o.detail, i],
      );
    }
    console.log(`Seeded ${BANK_OFFERS.length} bank offers.`);
  }

  await pool.end();
}

seedContent().catch((err) => {
  console.error("Content seed failed:", err);
  process.exit(1);
});
