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
  "Facials",
  "Waxing",
  "Brows & Lashes",
  "Consultations",
  "Add-Ons",
];

const GALLERY_CATEGORIES = [
  "Facials",
  "Brows",
  "Lashes",
  "Waxing",
  "Studio",
  "Results",
];

module.exports = {
  APPOINTMENT_STATUSES,
  BLOCKING_APPOINTMENT_STATUSES,
  GALLERY_CATEGORIES,
  USER_ROLES,
  SERVICE_CATEGORIES,
};
