const Availability = require("../models/Availability");
const BusinessSettings = require("../models/BusinessSettings");
const { env } = require("../config/env");
const {
  buildDefaultBusinessSettings,
  buildDefaultWeeklyHours,
} = require("./defaults");

async function ensureAvailability() {
  return Availability.findOneAndUpdate(
    { key: "default" },
    {
      $setOnInsert: {
        key: "default",
        weeklyHours: buildDefaultWeeklyHours(),
        timezone: env.defaultTimezone,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );
}

async function ensureBusinessSettings() {
  return BusinessSettings.findOneAndUpdate(
    { key: "default" },
    {
      $setOnInsert: buildDefaultBusinessSettings(),
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );
}

module.exports = { ensureAvailability, ensureBusinessSettings };
