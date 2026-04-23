const express = require("express");
const { uploadImage } = require("../controllers/uploadController");
const { requireRole } = require("../middleware/auth");
const { upload } = require("../lib/upload");

const router = express.Router();

router.post("/image", requireRole("admin"), upload.single("image"), uploadImage);

module.exports = router;
