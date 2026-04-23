const express = require("express");
const {
  createAppointment,
  deleteAppointment,
  getAppointment,
  getAppointments,
  getAvailableSlots,
  updateAppointment,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");
const { requireAuth, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  appointmentCreateSchema,
  appointmentStatusSchema,
  appointmentUpdateSchema,
  slotsQuerySchema,
} = require("../validators/schemas");

const router = express.Router();

router.get("/slots", validate(slotsQuerySchema, "query"), getAvailableSlots);
router.post("/", validate(appointmentCreateSchema), createAppointment);
router.get("/", requireAuth, getAppointments);
router.get("/:id", requireAuth, getAppointment);
router.put("/:id", requireAuth, validate(appointmentUpdateSchema), updateAppointment);
router.patch(
  "/:id/status",
  requireRole("admin"),
  validate(appointmentStatusSchema),
  updateAppointmentStatus,
);
router.delete("/:id", requireRole("admin"), deleteAppointment);

module.exports = router;
