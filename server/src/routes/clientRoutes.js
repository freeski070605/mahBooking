const express = require("express");
const { getClient, getClients } = require("../controllers/clientController");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireRole("admin"), getClients);
router.get("/:id", requireRole("admin"), getClient);

module.exports = router;
