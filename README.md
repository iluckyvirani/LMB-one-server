# LMB Shoes — API Server

Express + PostgreSQL (Neon) + Cloudinary, serving both `admin` and `website`.

## Setup

```bash
cd server
npm install
cp .env.example .env   # already done for you; fill in CLOUDINARY_* keys
npm run db:migrate     # creates tables on the Neon database
npm run db:seed        # creates admin login + 3 sample products
npm run dev            # http://localhost:4000
```

`db:seed` creates a starter admin account for local development. Log in once and change that password immediately; never keep the starter password on a deployed server.

Cloudinary keys are blank in `.env` — image upload (`/api/admin/products/upload-image`)
will fail until you add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
from your Cloudinary dashboard.

## Auth model

- **Admin**: email/password → JWT signed with `ADMIN_JWT_SECRET`, sent as `Authorization: Bearer <token>`.
- **Customer**: phone/OTP → JWT signed with `JWT_SECRET`. OTP is generated and stored in
  `otp_codes` (5 min expiry); no SMS gateway is wired up yet, so the code is printed to the
  server console (`[otp] <phone> -> <code>`) — swap in a real SMS provider when ready.

## Endpoint map — which frontend page/store calls what

### admin (Vite app)

| Page / store | Endpoint |
|---|---|
| `LoginPage` / `store/auth.ts` | `POST /api/admin/login` |
| `SettingsPage` (change password) | `POST /api/admin/change-password` |
| `DashboardPage` | `GET /api/admin/dashboard/stats` |
| `ProductsPage`, `store/products.ts` | `GET /api/products` (list/search reuses the public route) |
| `ProductFormPage` (create) | `POST /api/admin/products` |
| `ProductFormPage` (edit) | `PUT /api/admin/products/:id` |
| `ProductFormPage` (delete) | `DELETE /api/admin/products/:id` |
| `ProductFormPage` (image picker) | `POST /api/admin/products/upload-image` (multipart, field `image`) |
| `OrdersPage`, `OrderBoardPage`, `store/orders.ts` | `GET /api/admin/orders?status=&q=` |
| `OrderDetailPage` | `GET /api/admin/orders/:id`, `PATCH /api/admin/orders/:id/status` |
| `CustomersPage`, `store/customers.ts` | `GET /api/admin/customers?q=` |
| `CustomerDetailPage` | `GET /api/admin/customers/:id`, `PATCH /api/admin/customers/:id`, `PATCH /api/admin/customers/:id/block`, `DELETE /api/admin/customers/:id` |
| `ShippingPage`, `store/shipments.ts` | `GET /api/admin/shipments`, `POST /api/admin/shipments/:orderId/assign-awb`, `PATCH /api/admin/shipments/:orderId/status` |
| `SettingsPage`, `store/settings.ts` | `GET /api/admin/settings`, `PUT /api/admin/settings`, `PATCH /api/admin/settings/shiprocket` |

### website (Next.js app)

| Page / store | Endpoint |
|---|---|
| `shop`, `product/[slug]`, `lib/products.ts` | `GET /api/products?category=&style=&collection=&tag=&q=&sort=`, `GET /api/products/:idOrSlug` |
| `account` login (OTP), `store/auth.ts` | `POST /api/customer/request-otp`, `POST /api/customer/verify-otp` |
| `account` profile | `GET /api/customer/profile`, `PUT /api/customer/profile`, `GET /api/customer/me` |
| `account` addresses | `GET/POST /api/customer/addresses`, `PUT/DELETE /api/customer/addresses/:id` |
| `cart`, `store/cart.ts` | stays client-side (localStorage) — no API; only the final checkout hits the server |
| checkout → `store/orders.ts` `placeOrder` | `POST /api/orders` (works for guest or logged-in customer; validates stock server-side, decrements it, computes totals from DB prices — never trust client-sent prices) |
| `orders`, `orders/[id]` | `GET /api/customer/orders`, `GET /api/customer/orders/:id`, `GET /api/customer/orders/:id/shipment` |
| `wishlist`, `store/wishlist.ts` | `GET/POST /api/customer/wishlist`, `DELETE /api/customer/wishlist/:productId` |
| footer/COD badge/free-shipping banner | `GET /api/settings/public` (no auth — safe subset of store settings) |

Not yet wired to the DB: the website's `cart` and `wishlist` zustand stores currently persist
to `localStorage` only. The wishlist API above exists so you can migrate it once customer
login is wired into the website's UI; cart is fine staying client-only since it's ephemeral
pre-checkout state.

## Data model

See `src/db/schema.sql` for the full DDL. Tables: `admin_users`, `products`, `customers`,
`otp_codes`, `addresses`, `orders`, `order_items`, `shipments`, `wishlist_items`, `store_settings`.
