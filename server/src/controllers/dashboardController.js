const Service = require("../models/Service");
const GalleryItem = require("../models/GalleryItem");
const Appointment = require("../models/Appointment");
const Client = require("../models/Client");
const Inquiry = require("../models/Inquiry");

async function getDashboardSummary(_req, res) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const [
    todayAppointments,
    pendingAppointments,
    upcomingAppointments,
    activeServiceCount,
    draftServiceCount,
    galleryCount,
    clientCount,
    confirmedAppointmentCount,
    newInquiryCount,
  ] =
    await Promise.all([
      Appointment.find({
        startAt: {
          $gte: startOfToday,
          $lt: endOfToday,
        },
        status: { $ne: "canceled" },
      }).sort({ startAt: 1 }),
      Appointment.find({ status: "pending" }).sort({ startAt: 1 }).limit(6),
      Appointment.find({
        startAt: { $gte: startOfToday },
        status: { $in: ["pending", "confirmed"] },
      })
        .sort({ startAt: 1 })
        .limit(6),
      Service.countDocuments({ isActive: true }),
      Service.countDocuments({ isPublished: false }),
      GalleryItem.countDocuments(),
      Client.countDocuments(),
      Appointment.countDocuments({ status: "confirmed", startAt: { $gte: startOfToday } }),
      Inquiry.countDocuments({ status: "new" }),
    ]);

  res.json({
    stats: {
      todayCount: todayAppointments.length,
      pendingCount: pendingAppointments.length,
      upcomingCount: upcomingAppointments.length,
      activeServiceCount,
      draftServiceCount,
      galleryCount,
      clientCount,
      confirmedAppointmentCount,
      newInquiryCount,
    },
    todayAppointments,
    pendingAppointments,
    upcomingAppointments,
  });
}

module.exports = { getDashboardSummary };
