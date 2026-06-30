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
      requiresDeposit: Boolean,
      depositAmount: Number,
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
    intakeAnswers: {
      firstTimeClient: {
        type: String,
        trim: true,
        default: "",
      },
      skinType: {
        type: String,
        trim: true,
        default: "",
      },
      skinConcerns: {
        type: String,
        trim: true,
        default: "",
      },
      allergies: {
        type: String,
        trim: true,
        default: "",
      },
      currentSkincareRoutine: {
        type: String,
        trim: true,
        default: "",
      },
      retinolUse: {
        type: String,
        trim: true,
        default: "",
      },
      accutaneUse: {
        type: String,
        trim: true,
        default: "",
      },
      recentWaxing: {
        type: String,
        trim: true,
        default: "",
      },
      recentChemicalPeels: {
        type: String,
        trim: true,
        default: "",
      },
      pregnancyStatus: {
        type: String,
        trim: true,
        default: "",
      },
      appointmentGoals: {
        type: String,
        trim: true,
        default: "",
      },
      notes: {
        type: String,
        trim: true,
        default: "",
      },
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
