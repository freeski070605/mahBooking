const express = require("express");
const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");
const { requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { settingsSchema } = require("../validators/schemas");

const router = express.Router();

router.get("/", getSettings);
router.put("/", requireRole("admin"), validate(settingsSchema), updateSettings);

module.exports = router;
