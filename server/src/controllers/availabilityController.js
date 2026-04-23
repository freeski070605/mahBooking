const { ensureAvailability } = require("../lib/singletons");

async function getAvailability(_req, res) {
  const availability = await ensureAvailability();
  res.json({ availability });
}

async function updateAvailability(req, res) {
  const availability = await ensureAvailability();

  availability.weeklyHours = req.body.weeklyHours;
  availability.blockedDates = req.body.blockedDates;
  availability.dateOverrides = req.body.dateOverrides;
  availability.timezone = req.body.timezone;
  availability.slotIntervalMinutes = req.body.slotIntervalMinutes;
  availability.bookingWindowDays = req.body.bookingWindowDays;
  availability.advanceNoticeHours = req.body.advanceNoticeHours;

  await availability.save();

  res.json({ availability });
}

module.exports = { getAvailability, updateAvailability };
