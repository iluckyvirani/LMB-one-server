import "dotenv/config";
import express from "express";
import "express-async-errors";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import productsRoutes from "./routes/products.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import customersRoutes from "./routes/customers.routes.js";
import shipmentsRoutes from "./routes/shipments.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import recentlyViewedRoutes from "./routes/recentlyViewed.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import contentRoutes from "./routes/content.routes.js";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS ?? "").split(",").map((s) => s.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api", authRoutes);
app.use("/api", productsRoutes);
app.use("/api", ordersRoutes);
app.use("/api", customersRoutes);
app.use("/api", shipmentsRoutes);
app.use("/api", settingsRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", wishlistRoutes);
app.use("/api", cartRoutes);
app.use("/api", recentlyViewedRoutes);
app.use("/api", reviewsRoutes);
app.use("/api", contactRoutes);
app.use("/api", deliveryRoutes);
app.use("/api", contentRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: err.message ?? "Internal server error" });
});

export default app;
