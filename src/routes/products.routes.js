import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  removeProduct,
  uploadProductImage,
} from "../controllers/products.controller.js";

const router = Router();

// Public — website shop/product pages
router.get("/products", listProducts);
router.get("/products/:idOrSlug", getProduct);

// Admin — ProductsPage / ProductFormPage
router.post("/admin/products", requireAdmin, createProduct);
router.put("/admin/products/:id", requireAdmin, updateProduct);
router.delete("/admin/products/:id", requireAdmin, removeProduct);
router.post(
  "/admin/products/upload-image",
  requireAdmin,
  upload.single("image"),
  uploadProductImage,
);

export default router;
