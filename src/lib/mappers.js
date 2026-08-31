export function mapProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    style: row.style,
    collection: row.collection,
    tags: row.tags ?? [],
    price: Number(row.price),
    mrp: Number(row.mrp),
    rating: Number(row.rating),
    reviewsCount: row.reviews_count,
    stock: row.stock,
    sizes: row.sizes ?? [],
    colorway: row.colorway,
    color: row.color,
    colorHex: row.color_hex,
    swatch: [row.swatch_from, row.swatch_to],
    description: row.description,
    image: row.image,
    images: row.images ?? [],
  };
}

export function mapCustomer(row) {
  return {
    id: row.id,
    name: [row.first_name, row.last_name].filter(Boolean).join(" ") || "Customer",
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email ?? "",
    phone: row.phone,
    joinedAt: row.joined_at,
    ordersCount: Number(row.orders_count ?? 0),
    totalSpent: Number(row.total_spent ?? 0),
    blocked: row.blocked,
  };
}

export function mapAddress(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    addressLine1: row.address_line1,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    label: row.label,
    isDefault: row.is_default,
  };
}

export function mapOrder(row, items = []) {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    address: row.address_line1,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    paymentMethod: row.payment_method,
    items: items.map(mapOrderItem),
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
  };
}

export function mapOrderItem(row) {
  return {
    productId: row.product_id,
    title: row.title,
    slug: row.slug,
    price: Number(row.price),
    qty: row.qty,
    size: row.size,
    swatch: [row.swatch_from, row.swatch_to],
    image: row.image,
  };
}

export function mapBanner(row) {
  return {
    id: row.id,
    href: row.href,
    image: row.image,
    swatch: [row.swatch_from, row.swatch_to],
    badge: row.badge,
    eyebrow: row.eyebrow,
    title: row.title,
    subtitle: row.subtitle,
    cta: row.cta,
    position: row.position,
    active: row.active,
  };
}

export function mapTestimonial(row) {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    rating: row.rating,
    text: row.text,
    position: row.position,
    active: row.active,
  };
}

export function mapTrustItem(row) {
  return {
    id: row.id,
    icon: row.icon,
    label: row.label,
    description: row.description,
    position: row.position,
    active: row.active,
  };
}

export function mapBankOffer(row) {
  return {
    id: row.id,
    title: row.title,
    detail: row.detail,
    position: row.position,
    active: row.active,
  };
}

export function mapReview(row) {
  return {
    id: row.id,
    productId: row.product_id,
    customerName: [row.first_name, row.last_name].filter(Boolean).join(" ") || "Customer",
    rating: row.rating,
    text: row.text,
    createdAt: row.created_at,
  };
}

export function mapContactMessage(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    createdAt: row.created_at,
  };
}

export function mapShipment(row) {
  return {
    orderId: row.order_id,
    courier: row.courier,
    awbCode: row.awb_code,
    status: row.status,
    lastUpdate: row.last_update,
  };
}

export function mapSettings(row) {
  return {
    storeName: row.store_name,
    tagline: row.tagline,
    supportEmail: row.support_email,
    supportPhone: row.support_phone,
    whatsapp: row.whatsapp,
    gstin: row.gstin,
    taxPercent: Number(row.tax_percent),
    codEnabled: row.cod_enabled,
    codMaxAmount: Number(row.cod_max_amount),
    freeShippingThreshold: Number(row.free_shipping_threshold),
    shippingFee: Number(row.shipping_fee),
    deliveryEtaMinDays: row.delivery_eta_min_days,
    deliveryEtaMaxDays: row.delivery_eta_max_days,
    newsletterHeading: row.newsletter_heading,
    newsletterSubtext: row.newsletter_subtext,
    shiprocket: {
      enabled: row.shiprocket_enabled,
      email: row.shiprocket_email,
      apiKey: row.shiprocket_api_key,
      channelId: row.shiprocket_channel_id,
      pickupPincode: row.shiprocket_pickup_pincode,
    },
  };
}
