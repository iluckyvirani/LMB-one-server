import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import {
  getSettings,
  updateSettings,
  updateShiprocket,
  getPublicSettings,
} from "../controllers/settings.controller.js";

const router = Router();

// Public — website (COD/tax/free-shipping/ETA display)
router.get("/settings/public", getPublicSettings);

// Admin — SettingsPage
router.get("/admin/settings", requireAdmin, getSettings);
router.put("/admin/settings", requireAdmin, updateSettings);
router.patch("/admin/settings/shiprocket", requireAdmin, updateShiprocket);

export default router;
