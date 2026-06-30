const bcrypt = require("bcryptjs");
const { connectDb } = require("../config/db");
const { env } = require("../config/env");
const User = require("../models/User");
const Service = require("../models/Service");
const GalleryItem = require("../models/GalleryItem");
const Appointment = require("../models/Appointment");
const Availability = require("../models/Availability");
const Client = require("../models/Client");
const BusinessSettings = require("../models/BusinessSettings");
const {
  buildDefaultBusinessSettings,
  buildDefaultWeeklyHours,
} = require("../lib/defaults");

const starterServices = [
  ["Skin Consultation", "Consultations", 35, "fixed", 30],
  ["Custom Facial", "Facials", 85, "starting_at", 60],
  ["Deep Cleansing Facial", "Facials", 95, "starting_at", 75],
  ["Hydrating Facial", "Facials", 90, "starting_at", 60],
  ["Acne Facial", "Facials", 95, "starting_at", 60],
  ["Back Facial", "Facials", 100, "starting_at", 60],
  ["Brow Wax", "Waxing", 20, "fixed", 20],
  ["Lip Wax", "Waxing", 12, "fixed", 15],
  ["Chin Wax", "Waxing", 15, "fixed", 15],
  ["Underarm Wax", "Waxing", 30, "fixed", 25],
  ["Brow Tint", "Brows & Lashes", 25, "fixed", 25],
  ["Lash Lift", "Brows & Lashes", 75, "starting_at", 60],
  ["Dermaplaning Add-On", "Add-Ons", 35, "fixed", 20],
  ["Jelly Mask Add-On", "Add-Ons", 20, "fixed", 15],
  ["LED Therapy Add-On", "Add-Ons", 25, "fixed", 20],
  ["High Frequency Add-On", "Add-Ons", 20, "fixed", 15],
].map(([name, category, price, priceType, durationMinutes], index) => ({
  name,
  category,
  price,
  priceType,
  durationMinutes,
  bufferMinutes: category === "Add-Ons" ? 0 : 15,
  shortDescription: "Starter example service. Edit the details, pricing, and instructions before launch.",
  fullDescription:
    "This is editable placeholder copy for an esthetician service. Use the admin dashboard to tailor the description to the final service menu.",
  imageUrl: `https://placehold.co/900x1200/f7ede7/372d2a?text=${encodeURIComponent(name)}`,
  imagePublicId: "",
  requiresDeposit: false,
  depositAmount: 0,
  prepInstructions: "Add preparation instructions for this service before accepting bookings.",
  aftercareInstructions: "Add aftercare instructions for this service before accepting bookings.",
  contraindications: "Add any contraindications, warnings, or consultation notes for this service.",
  consultationRequired: name.includes("Consultation"),
  isActive: true,
  isPublished: true,
  displayOrder: index + 1,
  featured: index < 3,
}));

async function seed() {
  await connectDb();

  await Promise.all([
    User.deleteMany({}),
    Service.deleteMany({}),
    GalleryItem.deleteMany({}),
    Appointment.deleteMany({}),
    Availability.deleteMany({}),
    Client.deleteMany({}),
    BusinessSettings.deleteMany({}),
  ]);

  const adminPasswordHash = await bcrypt.hash(env.seedAdminPassword, 10);

  await User.create({
    name: "Mah Owner",
    email: env.seedAdminEmail,
    phone: "(555) 274-5612",
    passwordHash: adminPasswordHash,
    role: "admin",
  });

  await Availability.create({
    key: "default",
    weeklyHours: buildDefaultWeeklyHours(),
    blockedDates: [],
    dateOverrides: [],
    timezone: env.defaultTimezone,
    slotIntervalMinutes: 15,
    bookingWindowDays: 60,
    advanceNoticeHours: 2,
  });

  await BusinessSettings.create({
    ...buildDefaultBusinessSettings(),
    businessName: "MAH Esti",
    tagline:
      "Personalized skin care, smooth booking, and thoughtful follow-up from consultation to aftercare.",
    description:
      "MAH Esti is an esthetician booking and client-care studio built around flexible services, clear intake details, and a calm appointment experience.",
    contactEmail: "hello@mahesti.com",
    contactPhone: "(555) 274-5612",
    address: "Atlanta, GA",
    socialLinks: {
      instagram: "https://instagram.com/mahbooking",
      facebook: "https://facebook.com/mahbooking",
      tiktok: "https://tiktok.com/@mahbooking",
    },
  });

  await Service.insertMany(starterServices);

  console.log("Bootstrap complete");
  console.log("Editable starter esthetician services were created.");
  console.log(`Initial admin login: ${env.seedAdminEmail} / ${env.seedAdminPassword}`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("Bootstrap failed", error);
  process.exit(1);
});
