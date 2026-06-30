const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },
    fullDescription: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 15,
    },
    bufferMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    requiresDeposit: {
      type: Boolean,
      default: false,
    },
    depositAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    prepInstructions: {
      type: String,
      trim: true,
      default: "",
    },
    aftercareInstructions: {
      type: String,
      trim: true,
      default: "",
    },
    contraindications: {
      type: String,
      trim: true,
      default: "",
    },
    consultationRequired: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

serviceSchema.index({ category: 1, isActive: 1, displayOrder: 1 });

serviceSchema.pre("validate", function fillServiceDescriptions(next) {
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description;
  }

  if (!this.description && this.shortDescription) {
    this.description = this.shortDescription;
  }

  if (!this.fullDescription && this.shortDescription) {
    this.fullDescription = this.shortDescription;
  }

  if (!this.requiresDeposit) {
    this.depositAmount = 0;
  }

  next();
});

module.exports = mongoose.model("Service", serviceSchema);
