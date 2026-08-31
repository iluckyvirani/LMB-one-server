import { Router } from "express";
import { requireCustomer } from "../middleware/auth.js";
import {
  listMyWishlist,
  addToMyWishlist,
  removeFromMyWishlist,
} from "../controllers/wishlist.controller.js";

const router = Router();

// Customer — website wishlist page
router.get("/customer/wishlist", requireCustomer, listMyWishlist);
router.post("/customer/wishlist", requireCustomer, addToMyWishlist);
router.delete("/customer/wishlist/:productId", requireCustomer, removeFromMyWishlist);

export default router;
