import { Router } from "express";
import { requireAdmin, requireCustomer } from "../middleware/auth.js";
import {
  listShipments,
  getShipment,
  assignAwb,
  updateShipmentStatus,
  getShipmentForCustomer,
} from "../controllers/shipments.controller.js";

const router = Router();

// Admin — ShippingPage
router.get("/admin/shipments", requireAdmin, listShipments);
router.get("/admin/shipments/:orderId", requireAdmin, getShipment);
router.post("/admin/shipments/:orderId/assign-awb", requireAdmin, assignAwb);
router.patch("/admin/shipments/:orderId/status", requireAdmin, updateShipmentStatus);

// Customer — website order tracking
router.get("/customer/orders/:id/shipment", requireCustomer, getShipmentForCustomer);

export default router;
