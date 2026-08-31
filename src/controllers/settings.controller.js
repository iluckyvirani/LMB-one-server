import { pool } from "../db/pool.js";
import { mapSettings } from "../lib/mappers.js";

const FIELD_MAP = {
  storeName: "store_name",
  tagline: "tagline",
  supportEmail: "support_email",
  supportPhone: "support_phone",
  whatsapp: "whatsapp",
  gstin: "gstin",
  taxPercent: "tax_percent",
  codEnabled: "cod_enabled",
  codMaxAmount: "cod_max_amount",
  freeShippingThreshold: "free_shipping_threshold",
  shippingFee: "shipping_fee",
  deliveryEtaMinDays: "delivery_eta_min_days",
  deliveryEtaMaxDays: "delivery_eta_max_days",
  newsletterHeading: "newsletter_heading",
  newsletterSubtext: "newsletter_subtext",
};

// GET /api/admin/settings — SettingsPage
export async function getSettings(_req, res) {
  const { rows } = await pool.query("SELECT * FROM store_settings WHERE id = 1");
  res.json(mapSettings(rows[0]));
}

// PUT /api/admin/settings
export async function updateSettings(req, res) {
  const set = [];
  const params = [];
  for (const [key, col] of Object.entries(FIELD_MAP)) {
    if (req.body[key] === undefined) continue;
    params.push(req.body[key]);
    set.push(`${col} = $${params.length}`);
  }
  if (!set.length) return res.status(400).json({ error: "No fields to update" });
  const { rows } = await pool.query(
    `UPDATE store_settings SET ${set.join(", ")} WHERE id = 1 RETURNING *`,
    params,
  );
  res.json(mapSettings(rows[0]));
}

// PATCH /api/admin/settings/shiprocket
export async function updateShiprocket(req, res) {
  const { enabled, email, apiKey, channelId, pickupPincode } = req.body;
  const { rows } = await pool.query(
    `UPDATE store_settings SET
      shiprocket_enabled = COALESCE($1, shiprocket_enabled),
      shiprocket_email = COALESCE($2, shiprocket_email),
      shiprocket_api_key = COALESCE($3, shiprocket_api_key),
      shiprocket_channel_id = COALESCE($4, shiprocket_channel_id),
      shiprocket_pickup_pincode = COALESCE($5, shiprocket_pickup_pincode)
     WHERE id = 1 RETURNING *`,
    [enabled, email, apiKey, channelId, pickupPincode],
  );
  res.json(mapSettings(rows[0]));
}

// GET /api/settings/public — website: COD/tax/free-shipping/ETA display
export async function getPublicSettings(_req, res) {
  const { rows } = await pool.query("SELECT * FROM store_settings WHERE id = 1");
  const s = mapSettings(rows[0]);
  res.json({
    storeName: s.storeName,
    tagline: s.tagline,
    supportEmail: s.supportEmail,
    supportPhone: s.supportPhone,
    whatsapp: s.whatsapp,
    taxPercent: s.taxPercent,
    codEnabled: s.codEnabled,
    codMaxAmount: s.codMaxAmount,
    freeShippingThreshold: s.freeShippingThreshold,
    shippingFee: s.shippingFee,
    deliveryEtaMinDays: s.deliveryEtaMinDays,
    deliveryEtaMaxDays: s.deliveryEtaMaxDays,
    newsletterHeading: s.newsletterHeading,
    newsletterSubtext: s.newsletterSubtext,
  });
}
