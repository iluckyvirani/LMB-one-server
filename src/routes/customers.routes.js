import { Router } from "express";
import { requireAdmin, requireCustomer } from "../middleware/auth.js";
import {
  listCustomers,
  getCustomerAdmin,
  updateCustomerAdmin,
  setCustomerBlocked,
  removeCustomer,
  getMyProfile,
  updateMyProfile,
  listMyAddresses,
  createMyAddress,
  updateMyAddress,
  removeMyAddress,
} from "../controllers/customers.controller.js";

const router = Router();

// Admin — CustomersPage / CustomerDetailPage
router.get("/admin/customers", requireAdmin, listCustomers);
router.get("/admin/customers/:id", requireAdmin, getCustomerAdmin);
router.patch("/admin/customers/:id", requireAdmin, updateCustomerAdmin);
router.patch("/admin/customers/:id/block", requireAdmin, setCustomerBlocked);
router.delete("/admin/customers/:id", requireAdmin, removeCustomer);

// Customer — website account pages
router.get("/customer/profile", requireCustomer, getMyProfile);
router.put("/customer/profile", requireCustomer, updateMyProfile);
router.get("/customer/addresses", requireCustomer, listMyAddresses);
router.post("/customer/addresses", requireCustomer, createMyAddress);
router.put("/customer/addresses/:id", requireCustomer, updateMyAddress);
router.delete("/customer/addresses/:id", requireCustomer, removeMyAddress);

export default router;
