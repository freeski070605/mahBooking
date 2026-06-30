const express = require("express");
const {
  createClient,
  deleteClient,
  getClient,
  getClients,
  updateClient,
} = require("../controllers/clientController");
const { requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { clientSchema } = require("../validators/schemas");

const router = express.Router();

router.get("/", requireRole("admin"), getClients);
router.post("/", requireRole("admin"), validate(clientSchema), createClient);
router.get("/:id", requireRole("admin"), getClient);
router.put("/:id", requireRole("admin"), validate(clientSchema), updateClient);
router.delete("/:id", requireRole("admin"), deleteClient);

module.exports = router;
