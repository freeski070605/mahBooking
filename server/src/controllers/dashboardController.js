const Service = require("../models/Service");
const GalleryItem = require("../models/GalleryItem");
const Appointment = require("../models/Appointment");
const Client = require("../models/Client");

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
    galleryCount,
    clientCount,
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
      GalleryItem.countDocuments(),
      Client.countDocuments(),
    ]);

  res.json({
    stats: {
      todayCount: todayAppointments.length,
      pendingCount: pendingAppointments.length,
      upcomingCount: upcomingAppointments.length,
      activeServiceCount,
      galleryCount,
      clientCount,
    },
    todayAppointments,
    pendingAppointments,
    upcomingAppointments,
  });
}

module.exports = { getDashboardSummary };
