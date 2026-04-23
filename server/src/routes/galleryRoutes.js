const express = require("express");
const {
  createGalleryItem,
  deleteGalleryItem,
  getGallery,
  updateGalleryItem,
} = require("../controllers/galleryController");
const { requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { gallerySchema } = require("../validators/schemas");

const router = express.Router();

router.get("/", getGallery);
router.post("/", requireRole("admin"), validate(gallerySchema), createGalleryItem);
router.put("/:id", requireRole("admin"), validate(gallerySchema), updateGalleryItem);
router.delete("/:id", requireRole("admin"), deleteGalleryItem);

module.exports = router;
