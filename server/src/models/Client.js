const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: undefined,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    birthday: {
      type: Date,
      default: null,
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
    recommendedFollowUp: {
      type: String,
      trim: true,
      default: "",
    },
    firstVisitAt: {
      type: Date,
      default: null,
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
    tags: {
      type: [String],
      default: [],
    },
    noShowCount: {
      type: Number,
      default: 0,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    lastAppointmentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

clientSchema.index({ email: 1 }, { unique: true, sparse: true });

clientSchema.pre("validate", function fillClientName() {
  if (!this.name) {
    this.name = [this.firstName, this.lastName].filter(Boolean).join(" ").trim();
  }

  if ((!this.firstName || !this.lastName) && this.name) {
    const [firstName, ...rest] = this.name.split(" ");
    this.firstName = this.firstName || firstName || "";
    this.lastName = this.lastName || rest.join(" ");
  }

});

module.exports = mongoose.model("Client", clientSchema);
