import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import {
  submitContactMessage,
  listContactMessages,
  removeContactMessage,
} from "../controllers/contact.controller.js";

const router = Router();

// Public — website contact form
router.post("/contact", submitContactMessage);

// Admin — view submitted inquiries
router.get("/admin/contact-messages", requireAdmin, listContactMessages);
router.delete("/admin/contact-messages/:id", requireAdmin, removeContactMessage);

export default router;
