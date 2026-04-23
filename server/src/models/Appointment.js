const mongoose = require("mongoose");
const { APPOINTMENT_STATUSES } = require("../utils/constants");

const appointmentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    clientPhone: {
      type: String,
      required: true,
      trim: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    serviceSnapshot: {
      name: String,
      category: String,
      price: Number,
      durationMinutes: Number,
      bufferMinutes: Number,
      imageUrl: String,
    },
    date: {
      type: Date,
      required: true,
    },
    appointmentDate: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
    bufferEndAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: APPOINTMENT_STATUSES,
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    internalNotes: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      enum: ["client", "admin"],
      default: "client",
    },
  },
  {
    timestamps: true,
  },
);

appointmentSchema.index({ appointmentDate: 1, startAt: 1, status: 1 });
appointmentSchema.index({ clientEmail: 1, appointmentDate: -1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
