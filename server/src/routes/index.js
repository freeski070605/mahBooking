const express = require("express");
const authRoutes = require("./authRoutes");
const serviceRoutes = require("./serviceRoutes");
const galleryRoutes = require("./galleryRoutes");
const appointmentRoutes = require("./appointmentRoutes");
const availabilityRoutes = require("./availabilityRoutes");
const settingsRoutes = require("./settingsRoutes");
const uploadRoutes = require("./uploadRoutes");
const clientRoutes = require("./clientRoutes");
const dashboardRoutes = require("./dashboardRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/services", serviceRoutes);
router.use("/gallery", galleryRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/availability", availabilityRoutes);
router.use("/settings", settingsRoutes);
router.use("/uploads", uploadRoutes);
router.use("/clients", clientRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;
