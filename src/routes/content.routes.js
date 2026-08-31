import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import {
  listBanners,
  listBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
  listTestimonials,
  listTestimonialsAdmin,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  listTrustItems,
  listTrustItemsAdmin,
  createTrustItem,
  updateTrustItem,
  deleteTrustItem,
  listBankOffers,
  listBankOffersAdmin,
  createBankOffer,
  updateBankOffer,
  deleteBankOffer,
} from "../controllers/content.controller.js";

const router = Router();

// Public — website home page / product page
router.get("/banners", listBanners);
router.get("/testimonials", listTestimonials);
router.get("/trust-items", listTrustItems);
router.get("/bank-offers", listBankOffers);

// Admin — Content management
router.get("/admin/banners", requireAdmin, listBannersAdmin);
router.post("/admin/banners", requireAdmin, createBanner);
router.put("/admin/banners/:id", requireAdmin, updateBanner);
router.delete("/admin/banners/:id", requireAdmin, deleteBanner);

router.get("/admin/testimonials", requireAdmin, listTestimonialsAdmin);
router.post("/admin/testimonials", requireAdmin, createTestimonial);
router.put("/admin/testimonials/:id", requireAdmin, updateTestimonial);
router.delete("/admin/testimonials/:id", requireAdmin, deleteTestimonial);

router.get("/admin/trust-items", requireAdmin, listTrustItemsAdmin);
router.post("/admin/trust-items", requireAdmin, createTrustItem);
router.put("/admin/trust-items/:id", requireAdmin, updateTrustItem);
router.delete("/admin/trust-items/:id", requireAdmin, deleteTrustItem);

router.get("/admin/bank-offers", requireAdmin, listBankOffersAdmin);
router.post("/admin/bank-offers", requireAdmin, createBankOffer);
router.put("/admin/bank-offers/:id", requireAdmin, updateBankOffer);
router.delete("/admin/bank-offers/:id", requireAdmin, deleteBankOffer);

export default router;
