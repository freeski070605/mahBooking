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
const { buildStarterServices } = require("../lib/starterServices");

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
    starterServicesSeeded: true,
  });

  await Service.insertMany(buildStarterServices());

  console.log("Bootstrap complete");
  console.log("Editable starter esthetician services were created.");
  console.log(`Initial admin login: ${env.seedAdminEmail} / ${env.seedAdminPassword}`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("Bootstrap failed", error);
  process.exit(1);
});
