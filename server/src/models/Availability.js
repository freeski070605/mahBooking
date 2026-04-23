const mongoose = require("mongoose");
const { buildDefaultWeeklyHours } = require("../lib/defaults");

const breakSchema = new mongoose.Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false },
);

const dayScheduleSchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    label: { type: String, required: true },
    isOpen: { type: Boolean, default: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    breaks: { type: [breakSchema], default: [] },
  },
  { _id: false },
);

const blockedDateSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    start: { type: String, default: "" },
    end: { type: String, default: "" },
    allDay: { type: Boolean, default: true },
    reason: { type: String, default: "" },
  },
  { _id: false },
);

const dateOverrideSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    isOpen: { type: Boolean, default: true },
    start: { type: String, default: "09:00" },
    end: { type: String, default: "17:00" },
    breaks: { type: [breakSchema], default: [] },
  },
  { _id: false },
);

const availabilitySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "default",
      unique: true,
    },
    weeklyHours: {
      type: [dayScheduleSchema],
      default: buildDefaultWeeklyHours,
    },
    blockedDates: {
      type: [blockedDateSchema],
      default: [],
    },
    dateOverrides: {
      type: [dateOverrideSchema],
      default: [],
    },
    timezone: {
      type: String,
      default: "America/New_York",
    },
    slotIntervalMinutes: {
      type: Number,
      default: 15,
    },
    bookingWindowDays: {
      type: Number,
      default: 60,
    },
    advanceNoticeHours: {
      type: Number,
      default: 2,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Availability", availabilitySchema);
