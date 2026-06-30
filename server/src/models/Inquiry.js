const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "booked", "closed"],
      default: "new",
    },
    privateNote: {
      type: String,
      trim: true,
      default: "",
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

inquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Inquiry", inquirySchema);
