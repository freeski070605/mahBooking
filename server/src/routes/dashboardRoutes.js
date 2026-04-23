const express = require("express");
const { getDashboardSummary } = require("../controllers/dashboardController");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/summary", requireRole("admin"), getDashboardSummary);

module.exports = router;
