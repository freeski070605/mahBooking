const express = require("express");
const {
  getAvailability,
  updateAvailability,
} = require("../controllers/availabilityController");
const { requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { availabilitySchema } = require("../validators/schemas");

const router = express.Router();

router.get("/", getAvailability);
router.put("/", requireRole("admin"), validate(availabilitySchema), updateAvailability);

module.exports = router;
