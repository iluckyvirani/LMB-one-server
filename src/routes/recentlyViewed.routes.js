import { Router } from "express";
import { requireCustomer } from "../middleware/auth.js";
import { listMyRecentlyViewed, recordMyView } from "../controllers/recentlyViewed.controller.js";

const router = Router();

// Customer — website "Recently Viewed" rail, synced for logged-in customers
router.get("/customer/recently-viewed", requireCustomer, listMyRecentlyViewed);
router.post("/customer/recently-viewed", requireCustomer, recordMyView);

export default router;
