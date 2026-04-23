const mongoose = require("mongoose");
const { buildDefaultBusinessSettings } = require("../lib/defaults");

const businessSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "default",
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    contactEmail: {
      type: String,
      trim: true,
      default: "",
    },
    contactPhone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    policies: {
      cancellation: { type: String, default: "" },
      lateness: { type: String, default: "" },
      deposit: { type: String, default: "" },
      expectations: { type: String, default: "" },
    },
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      tiktok: { type: String, default: "" },
    },
    bookingSettings: {
      allowClientCancelHours: { type: Number, default: 24 },
      allowClientRescheduleHours: { type: Number, default: 24 },
      bookingWindowDays: { type: Number, default: 60 },
      advanceNoticeHours: { type: Number, default: 2 },
      confirmationMessage: { type: String, default: "" },
    },
    branding: {
      primaryColor: { type: String, default: "#e7792d" },
      accentColor: { type: String, default: "#f2c7a5" },
      neutralColor: { type: String, default: "#f7efe8" },
      logoUrl: { type: String, default: "" },
      heroImageUrl: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  },
);

businessSettingsSchema.statics.getDefaultPayload = buildDefaultBusinessSettings;

module.exports = mongoose.model("BusinessSettings", businessSettingsSchema);
