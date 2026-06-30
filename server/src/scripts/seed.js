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
  ["Custom Facial", "Facials", 85, 60],
  ["Deep Cleansing Facial", "Facials", 95, 75],
  ["Hydrating Facial", "Facials", 90, 60],
  ["Acne Facial", "Facials", 95, 60],
  ["Back Facial", "Facials", 100, 60],
  ["Brow Wax", "Waxing", 20, 20],
  ["Lip Wax", "Waxing", 12, 15],
  ["Chin Wax", "Waxing", 15, 15],
  ["Underarm Wax", "Waxing", 30, 25],
  ["Brow Tint", "Brows & Lashes", 25, 25],
  ["Lash Lift", "Brows & Lashes", 75, 60],
  ["Skin Consultation", "Consultations", 35, 30],
  ["Dermaplaning Add-On", "Add-Ons", 35, 20],
  ["Jelly Mask Add-On", "Add-Ons", 20, 15],
  ["LED Therapy Add-On", "Add-Ons", 25, 20],
  ["High Frequency Add-On", "Add-Ons", 20, 15],
].map(([name, category, price, durationMinutes], index) => ({
  name,
  category,
  price,
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
