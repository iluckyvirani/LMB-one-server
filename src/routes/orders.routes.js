import { Router } from "express";
import { requireAdmin, requireCustomer, optionalCustomer } from "../middleware/auth.js";
import {
  createOrder,
  listOrders,
  getOrderAdmin,
  updateOrderStatus,
  listMyOrders,
  getMyOrder,
} from "../controllers/orders.controller.js";

const router = Router();

// Public/customer — website checkout (works for guest or logged-in customer)
router.post("/orders", optionalCustomer, createOrder);

// Customer — website order history / tracking
router.get("/customer/orders", requireCustomer, listMyOrders);
router.get("/customer/orders/:id", requireCustomer, getMyOrder);

// Admin — OrdersPage / OrderDetailPage / OrderBoardPage
router.get("/admin/orders", requireAdmin, listOrders);
router.get("/admin/orders/:id", requireAdmin, getOrderAdmin);
router.patch("/admin/orders/:id/status", requireAdmin, updateOrderStatus);

export default router;
