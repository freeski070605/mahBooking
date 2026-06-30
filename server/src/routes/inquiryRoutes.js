const express = require("express");
const {
  convertInquiryToClient,
  createInquiry,
  getInquiries,
  updateInquiry,
} = require("../controllers/inquiryController");
const { requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { inquirySchema, inquiryUpdateSchema } = require("../validators/schemas");

const router = express.Router();

router.post("/", validate(inquirySchema), createInquiry);
router.get("/", requireRole("admin"), getInquiries);
router.put("/:id", requireRole("admin"), validate(inquiryUpdateSchema), updateInquiry);
router.post("/:id/convert", requireRole("admin"), convertInquiryToClient);

module.exports = router;
