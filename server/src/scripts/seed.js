const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");
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
  const admin = await User.create({
    name: "Mah Owner",
    email: env.seedAdminEmail,
    phone: "(555) 274-5612",
    passwordHash: adminPasswordHash,
    role: "admin",
  });

  const clientUser = await User.create({
    name: "Janelle Brooks",
    email: "janelle@example.com",
    phone: "(555) 101-8842",
    passwordHash: await bcrypt.hash("ClientDemo123!", 10),
    role: "client",
  });

  const services = await Service.insertMany([
    {
      name: "Silk Press & Shape",
      category: "Signature Styling",
      description:
        "A polished silk press finished with a soft shape-up and lightweight movement for a smooth premium finish.",
      price: 115,
      durationMinutes: 105,
      bufferMinutes: 15,
      imageUrl:
        "https://placehold.co/1200x1600/f3e7df/3e302a?text=Silk+Press",
      imagePublicId: "",
      displayOrder: 1,
      featured: true,
      isActive: true,
    },
    {
      name: "Gloss & Blowout",
      category: "Color",
      description:
        "A shine-enhancing gloss paired with a silky blowout for refreshed tone, dimension, and mirror-like finish.",
      price: 145,
      durationMinutes: 120,
      bufferMinutes: 15,
      imageUrl:
        "https://placehold.co/1200x1600/f0dfd3/3b2d28?text=Gloss+%26+Blowout",
      imagePublicId: "",
      displayOrder: 2,
      featured: true,
      isActive: true,
    },
    {
      name: "Scalp Reset Ritual",
      category: "Scalp Care",
      description:
        "A nourishing cleanse, steam treatment, and scalp-focused care ritual designed to support healthy hair growth.",
      price: 95,
      durationMinutes: 75,
      bufferMinutes: 15,
      imageUrl:
        "https://placehold.co/1200x1600/ead4c5/3a2c27?text=Scalp+Reset",
      imagePublicId: "",
      displayOrder: 3,
      featured: false,
      isActive: true,
    },
    {
      name: "Bridal Preview Styling",
      category: "Bridal",
      description:
        "A planning-focused bridal styling preview to test shape, finish, and accessory placement before the big day.",
      price: 185,
      durationMinutes: 150,
      bufferMinutes: 20,
      imageUrl:
        "https://placehold.co/1200x1600/efe2d8/382b27?text=Bridal+Preview",
      imagePublicId: "",
      displayOrder: 4,
      featured: true,
      isActive: true,
    },
    {
      name: "Signature Facial Prep",
      category: "Facials",
      description:
        "A future esthetician offering placeholder for a glow-focused facial designed to complement the expanded beauty menu.",
      price: 125,
      durationMinutes: 75,
      bufferMinutes: 15,
      imageUrl:
        "https://placehold.co/1200x1600/f7ede7/372d2a?text=Coming+Soon",
      imagePublicId: "",
      displayOrder: 5,
      featured: false,
      isActive: false,
    },
  ]);

  await GalleryItem.insertMany([
    {
      title: "Soft movement",
      caption: "Silky finish with body, gloss, and clean shape.",
      category: "Signature Styling",
      imageUrl:
        "https://placehold.co/1000x1400/eddccf/382d29?text=Gallery+One",
      imagePublicId: "",
      isFeatured: true,
      displayOrder: 1,
    },
    {
      title: "Dimensional refresh",
      caption: "Gloss work that keeps tone warm, healthy, and light-reflective.",
      category: "Color",
      imageUrl:
        "https://placehold.co/1000x1400/f2e6de/362b27?text=Gallery+Two",
      imagePublicId: "",
      isFeatured: true,
      displayOrder: 2,
    },
    {
      title: "Bridal elegance",
      caption: "A refined bridal preview with clean structure and softness.",
      category: "Bridal",
      imageUrl:
        "https://placehold.co/1000x1400/ead9cf/3b302c?text=Gallery+Three",
      imagePublicId: "",
      isFeatured: false,
      displayOrder: 3,
    },
    {
      title: "Future skin menu",
      caption: "A visual placeholder for the esthetician phase of the brand.",
      category: "Facials",
      imageUrl:
        "https://placehold.co/1000x1400/f5ece5/3c312c?text=Future+Glow",
      imagePublicId: "",
      isFeatured: false,
      displayOrder: 4,
    },
  ]);

  await Availability.create({
    key: "default",
    weeklyHours: buildDefaultWeeklyHours(),
    blockedDates: [
      {
        date: dayjs().add(6, "day").format("YYYY-MM-DD"),
        allDay: true,
        reason: "Class day",
      },
    ],
    dateOverrides: [
      {
        date: dayjs().add(2, "day").format("YYYY-MM-DD"),
        isOpen: true,
        start: "11:00",
        end: "16:00",
        breaks: [{ start: "13:00", end: "13:30" }],
      },
    ],
    timezone: env.defaultTimezone,
    slotIntervalMinutes: 15,
    bookingWindowDays: 60,
    advanceNoticeHours: 2,
  });

  await BusinessSettings.create({
    ...buildDefaultBusinessSettings(),
    businessName: "MAH Booking",
    tagline: "Luxury care for healthy hair today, skin rituals tomorrow.",
    description:
      "A boutique booking experience for a solo beauty professional offering elevated hair services now and esthetician services in the next phase of growth.",
    contactEmail: "hello@mahbooking.com",
    contactPhone: "(555) 274-5612",
    address: "Atlanta, GA",
    socialLinks: {
      instagram: "https://instagram.com/mahbooking",
      facebook: "https://facebook.com/mahbooking",
      tiktok: "https://tiktok.com/@mahbooking",
    },
  });

  const clients = await Client.insertMany([
    {
      userId: clientUser._id,
      name: clientUser.name,
      email: clientUser.email,
      phone: clientUser.phone,
      notes: "Prefers a warm, natural finish and low-fragrance products.",
      internalNotes: "Very consistent rebooker.",
      lastAppointmentAt: dayjs().subtract(12, "day").toDate(),
    },
    {
      name: "Arielle Hayes",
      email: "arielle@example.com",
      phone: "(555) 663-1920",
      notes: "Sensitive scalp. Check in before heat styling.",
      internalNotes: "",
      lastAppointmentAt: dayjs().subtract(4, "day").toDate(),
    },
  ]);

  const [silkPress, glossBlowout, scalpReset] = services;
  const [janelle, arielle] = clients;

  await Appointment.insertMany([
    {
      clientId: janelle._id,
      userId: clientUser._id,
      clientName: janelle.name,
      clientEmail: janelle.email,
      clientPhone: janelle.phone,
      serviceId: silkPress._id,
      serviceSnapshot: {
        name: silkPress.name,
        category: silkPress.category,
        price: silkPress.price,
        durationMinutes: silkPress.durationMinutes,
        bufferMinutes: silkPress.bufferMinutes,
        imageUrl: silkPress.imageUrl,
      },
      date: dayjs().startOf("day").toDate(),
      appointmentDate: dayjs().format("YYYY-MM-DD"),
      startTime: "10:00",
      endTime: "11:45",
      startAt: dayjs().hour(10).minute(0).second(0).millisecond(0).toDate(),
      endAt: dayjs().hour(11).minute(45).second(0).millisecond(0).toDate(),
      bufferEndAt: dayjs()
        .hour(12)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate(),
      status: "confirmed",
      notes: "First appointment after trim.",
      internalNotes: "Offer rebook for gloss refresh.",
      source: "client",
    },
    {
      clientId: arielle._id,
      clientName: arielle.name,
      clientEmail: arielle.email,
      clientPhone: arielle.phone,
      serviceId: glossBlowout._id,
      serviceSnapshot: {
        name: glossBlowout.name,
        category: glossBlowout.category,
        price: glossBlowout.price,
        durationMinutes: glossBlowout.durationMinutes,
        bufferMinutes: glossBlowout.bufferMinutes,
        imageUrl: glossBlowout.imageUrl,
      },
      date: dayjs().add(1, "day").startOf("day").toDate(),
      appointmentDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
      startTime: "12:30",
      endTime: "14:30",
      startAt: dayjs()
        .add(1, "day")
        .hour(12)
        .minute(30)
        .second(0)
        .millisecond(0)
        .toDate(),
      endAt: dayjs()
        .add(1, "day")
        .hour(14)
        .minute(30)
        .second(0)
        .millisecond(0)
        .toDate(),
      bufferEndAt: dayjs()
        .add(1, "day")
        .hour(14)
        .minute(45)
        .second(0)
        .millisecond(0)
        .toDate(),
      status: "pending",
      notes: "Interested in gloss maintenance plan.",
      internalNotes: "",
      source: "client",
    },
    {
      clientId: janelle._id,
      userId: clientUser._id,
      clientName: janelle.name,
      clientEmail: janelle.email,
      clientPhone: janelle.phone,
      serviceId: scalpReset._id,
      serviceSnapshot: {
        name: scalpReset.name,
        category: scalpReset.category,
        price: scalpReset.price,
        durationMinutes: scalpReset.durationMinutes,
        bufferMinutes: scalpReset.bufferMinutes,
        imageUrl: scalpReset.imageUrl,
      },
      date: dayjs().subtract(12, "day").startOf("day").toDate(),
      appointmentDate: dayjs().subtract(12, "day").format("YYYY-MM-DD"),
      startTime: "09:30",
      endTime: "10:45",
      startAt: dayjs()
        .subtract(12, "day")
        .hour(9)
        .minute(30)
        .second(0)
        .millisecond(0)
        .toDate(),
      endAt: dayjs()
        .subtract(12, "day")
        .hour(10)
        .minute(45)
        .second(0)
        .millisecond(0)
        .toDate(),
      bufferEndAt: dayjs()
        .subtract(12, "day")
        .hour(11)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toDate(),
      status: "completed",
      notes: "Scalp felt dry after travel.",
      internalNotes: "",
      source: "client",
    },
  ]);

  console.log("Seed complete");
  console.log(`Admin login: ${env.seedAdminEmail} / ${env.seedAdminPassword}`);
  console.log("Client login: janelle@example.com / ClientDemo123!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
