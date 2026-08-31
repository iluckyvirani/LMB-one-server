import { Router } from "express";
import { requireCustomer } from "../middleware/auth.js";
import { listProductReviews, createReview } from "../controllers/reviews.controller.js";

const router = Router();

// Public — website product page
router.get("/products/:productId/reviews", listProductReviews);

// Customer — verified-purchase review submission
router.post("/customer/products/:productId/reviews", requireCustomer, createReview);

export default router;
