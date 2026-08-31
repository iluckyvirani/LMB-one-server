import { Router } from "express";
import { requireAdmin, requireCustomer } from "../middleware/auth.js";
import {
  adminLogin,
  adminChangePassword,
  requestOtp,
  verifyOtp,
  me,
} from "../controllers/auth.controller.js";

const router = Router();

// Admin — LoginPage / SettingsPage
router.post("/admin/login", adminLogin);
router.post("/admin/change-password", requireAdmin, adminChangePassword);

// Customer — website OTP login
router.post("/customer/request-otp", requestOtp);
router.post("/customer/verify-otp", verifyOtp);
router.get("/customer/me", requireCustomer, me);

export default router;
