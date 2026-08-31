import { Router } from "express";
import { checkPincode } from "../controllers/delivery.controller.js";

const router = Router();

// Public — website product page delivery-pincode check
router.get("/delivery/check", checkPincode);

export default router;
