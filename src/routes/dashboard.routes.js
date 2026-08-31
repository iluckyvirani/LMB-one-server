import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { getStats } from "../controllers/dashboard.controller.js";

const router = Router();

// Admin — DashboardPage
router.get("/admin/dashboard/stats", requireAdmin, getStats);

export default router;
