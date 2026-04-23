const express = require("express");
const {
  createService,
  deleteService,
  getService,
  getServices,
  toggleService,
  updateService,
} = require("../controllers/serviceController");
const { requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { serviceSchema } = require("../validators/schemas");

const router = express.Router();

router.get("/", getServices);
router.get("/:id", getService);
router.post("/", requireRole("admin"), validate(serviceSchema), createService);
router.put("/:id", requireRole("admin"), validate(serviceSchema), updateService);
router.patch("/:id/toggle", requireRole("admin"), toggleService);
router.delete("/:id", requireRole("admin"), deleteService);

module.exports = router;
