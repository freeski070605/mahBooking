const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "canceled",
  "no-show",
];

const BLOCKING_APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "no-show",
];

const USER_ROLES = ["admin", "client"];

const SERVICE_CATEGORIES = [
  "Signature Styling",
  "Color",
  "Treatments",
  "Protective Styles",
  "Bridal",
  "Scalp Care",
  "Facials",
  "Brows",
  "Waxing",
];

module.exports = {
  APPOINTMENT_STATUSES,
  BLOCKING_APPOINTMENT_STATUSES,
  USER_ROLES,
  SERVICE_CATEGORIES,
};
