-- LMB Shoes — schema (Postgres / Neon)

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('men','women','kids','sports')),
  style TEXT NOT NULL CHECK (style IN ('formal','casual','heels','flats','sandals','sports','boots')),
  collection TEXT NOT NULL CHECK (collection IN ('LMB Heritage','LMB Édition','LMB Sport')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  price NUMERIC(10,2) NOT NULL,
  mrp NUMERIC(10,2) NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  sizes INTEGER[] NOT NULL DEFAULT '{}',
  colorway TEXT,
  color TEXT,
  color_hex TEXT,
  swatch_from TEXT,
  swatch_to TEXT,
  description TEXT,
  image TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT ('c_' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  blocked BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS otp_codes (
  phone TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY DEFAULT ('addr_' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'Home' CHECK (label IN ('Home','Work','Other')),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ordered'
    CHECK (status IN ('ordered','packed','shipped','out_for_delivery','delivered','cancelled')),
  subtotal NUMERIC(10,2) NOT NULL,
  shipping NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT,
  price NUMERIC(10,2) NOT NULL,
  qty INTEGER NOT NULL,
  size INTEGER NOT NULL,
  swatch_from TEXT,
  swatch_to TEXT,
  image TEXT
);

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS slug TEXT;

CREATE TABLE IF NOT EXISTS shipments (
  order_id TEXT PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  courier TEXT,
  awb_code TEXT,
  status TEXT NOT NULL DEFAULT 'not_shipped'
    CHECK (status IN ('not_shipped','awb_assigned','picked_up','in_transit','out_for_delivery','delivered','rto')),
  last_update TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (customer_id, product_id)
);

CREATE TABLE IF NOT EXISTS cart_items (
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size INTEGER NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (customer_id, product_id, size)
);

CREATE TABLE IF NOT EXISTS recently_viewed (
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (customer_id, product_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, customer_id)
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  href TEXT NOT NULL DEFAULT '/shop',
  image TEXT,
  swatch_from TEXT NOT NULL DEFAULT '#1a1a1a',
  swatch_to TEXT NOT NULL DEFAULT '#3a3a3a',
  badge TEXT NOT NULL DEFAULT '',
  eyebrow TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  cta TEXT NOT NULL DEFAULT 'Shop Now',
  position INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  text TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trust_items (
  id SERIAL PRIMARY KEY,
  icon TEXT NOT NULL DEFAULT 'truck',
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS bank_offers (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS store_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name TEXT NOT NULL DEFAULT 'LMB Shoes',
  tagline TEXT NOT NULL DEFAULT 'Step into luxury',
  support_email TEXT NOT NULL DEFAULT 'support@lmbshoes.com',
  support_phone TEXT NOT NULL DEFAULT '+91 98765 43210',
  whatsapp TEXT NOT NULL DEFAULT '919876543210',
  gstin TEXT NOT NULL DEFAULT '',
  tax_percent NUMERIC(5,2) NOT NULL DEFAULT 12,
  cod_enabled BOOLEAN NOT NULL DEFAULT true,
  cod_max_amount NUMERIC(10,2) NOT NULL DEFAULT 10000,
  free_shipping_threshold NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 99,
  delivery_eta_min_days INTEGER NOT NULL DEFAULT 3,
  delivery_eta_max_days INTEGER NOT NULL DEFAULT 7,
  shiprocket_enabled BOOLEAN NOT NULL DEFAULT false,
  shiprocket_email TEXT NOT NULL DEFAULT '',
  shiprocket_api_key TEXT NOT NULL DEFAULT '',
  shiprocket_channel_id TEXT NOT NULL DEFAULT '',
  shiprocket_pickup_pincode TEXT NOT NULL DEFAULT '',
  newsletter_heading TEXT NOT NULL DEFAULT 'Get 10% off your first order',
  newsletter_subtext TEXT NOT NULL DEFAULT 'Sign up for drops, restocks and members-only offers.'
);

ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 99;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS newsletter_heading TEXT NOT NULL DEFAULT 'Get 10% off your first order';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS newsletter_subtext TEXT NOT NULL DEFAULT 'Sign up for drops, restocks and members-only offers.';

INSERT INTO store_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_style ON products(style);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_addresses_customer ON addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
