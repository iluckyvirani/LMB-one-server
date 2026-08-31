import { Router } from "express";
import { requireCustomer } from "../middleware/auth.js";
import {
  listMyCart,
  addToMyCart,
  setMyCartItemQty,
  removeMyCartItem,
  clearMyCart,
} from "../controllers/cart.controller.js";

const router = Router();

// Customer — website cart, synced for logged-in customers
router.get("/customer/cart", requireCustomer, listMyCart);
router.post("/customer/cart", requireCustomer, addToMyCart);
router.put("/customer/cart/:productId/:size", requireCustomer, setMyCartItemQty);
router.delete("/customer/cart/:productId/:size", requireCustomer, removeMyCartItem);
router.delete("/customer/cart", requireCustomer, clearMyCart);

export default router;
