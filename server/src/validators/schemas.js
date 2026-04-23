const { z } = require("zod");
const { APPOINTMENT_STATUSES } = require("../utils/constants");

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const authRegisterSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).optional().default(""),
  password: z.string().min(8),
  role: z.enum(["admin", "client"]).optional().default("client"),
});

const authLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const serviceSchema = z.object({
  name: z.string().trim().min(2),
  category: z.string().trim().min(2),
  description: z.string().trim().min(10),
  price: z.coerce.number().min(0),
  durationMinutes: z.coerce.number().int().min(15),
  bufferMinutes: z.coerce.number().int().min(0).default(0),
  imageUrl: z.string().trim().optional().default(""),
  imagePublicId: z.string().trim().optional().default(""),
  isActive: z.coerce.boolean().optional().default(true),
  displayOrder: z.coerce.number().int().min(0).optional().default(0),
  featured: z.coerce.boolean().optional().default(false),
});

const gallerySchema = z.object({
  title: z.string().trim().optional().default(""),
  caption: z.string().trim().optional().default(""),
  category: z.string().trim().min(2),
  imageUrl: z.string().trim().min(1),
  imagePublicId: z.string().trim().optional().default(""),
  isFeatured: z.coerce.boolean().optional().default(false),
  displayOrder: z.coerce.number().int().min(0).optional().default(0),
});

const appointmentCreateSchema = z.object({
  clientName: z.string().trim().min(2),
  clientEmail: z.string().trim().email(),
  clientPhone: z.string().trim().min(7),
  serviceId: z.string().trim().min(1),
  date: z.string().regex(dateRegex),
  startTime: z.string().regex(timeRegex),
  notes: z.string().trim().optional().default(""),
  internalNotes: z.string().trim().optional().default(""),
});

const appointmentUpdateSchema = z.object({
  clientName: z.string().trim().min(2).optional(),
  clientEmail: z.string().trim().email().optional(),
  clientPhone: z.string().trim().min(7).optional(),
  serviceId: z.string().trim().min(1).optional(),
  date: z.string().regex(dateRegex).optional(),
  startTime: z.string().regex(timeRegex).optional(),
  notes: z.string().trim().optional(),
  internalNotes: z.string().trim().optional(),
  status: z.enum(APPOINTMENT_STATUSES).optional(),
});

const appointmentStatusSchema = z.object({
  status: z.enum(APPOINTMENT_STATUSES),
});

const slotsQuerySchema = z.object({
  serviceId: z.string().trim().min(1),
  date: z.string().regex(dateRegex),
});

const breakSchema = z.object({
  start: z.string().regex(timeRegex),
  end: z.string().regex(timeRegex),
});

const availabilitySchema = z.object({
  weeklyHours: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      label: z.string().trim().min(1),
      isOpen: z.boolean(),
      start: z.string().regex(timeRegex),
      end: z.string().regex(timeRegex),
      breaks: z.array(breakSchema).default([]),
    }),
  ),
  blockedDates: z
    .array(
      z.object({
        date: z.string().regex(dateRegex),
        start: z.string().optional().default(""),
        end: z.string().optional().default(""),
        allDay: z.boolean().default(true),
        reason: z.string().optional().default(""),
      }),
    )
    .default([]),
  dateOverrides: z
    .array(
      z.object({
        date: z.string().regex(dateRegex),
        isOpen: z.boolean().default(true),
        start: z.string().regex(timeRegex),
        end: z.string().regex(timeRegex),
        breaks: z.array(breakSchema).default([]),
      }),
    )
    .default([]),
  timezone: z.string().trim().min(1),
  slotIntervalMinutes: z.coerce.number().int().min(5).max(60).default(15),
  bookingWindowDays: z.coerce.number().int().min(7).max(365).default(60),
  advanceNoticeHours: z.coerce.number().int().min(0).max(168).default(2),
});

const settingsSchema = z.object({
  businessName: z.string().trim().min(2),
  tagline: z.string().trim().optional().default(""),
  description: z.string().trim().optional().default(""),
  contactEmail: z.string().trim().email(),
  contactPhone: z.string().trim().min(7),
  address: z.string().trim().optional().default(""),
  policies: z.object({
    cancellation: z.string().trim().optional().default(""),
    lateness: z.string().trim().optional().default(""),
    deposit: z.string().trim().optional().default(""),
    expectations: z.string().trim().optional().default(""),
  }),
  socialLinks: z.object({
    instagram: z.string().trim().optional().default(""),
    facebook: z.string().trim().optional().default(""),
    tiktok: z.string().trim().optional().default(""),
  }),
  bookingSettings: z.object({
    allowClientCancelHours: z.coerce.number().int().min(0).max(168).default(24),
    allowClientRescheduleHours: z
      .coerce
      .number()
      .int()
      .min(0)
      .max(168)
      .default(24),
    bookingWindowDays: z.coerce.number().int().min(7).max(365).default(60),
    advanceNoticeHours: z.coerce.number().int().min(0).max(168).default(2),
    confirmationMessage: z.string().trim().optional().default(""),
  }),
  branding: z.object({
    primaryColor: z.string().trim().optional().default("#e7792d"),
    accentColor: z.string().trim().optional().default("#f2c7a5"),
    neutralColor: z.string().trim().optional().default("#f7efe8"),
    logoUrl: z.string().trim().optional().default(""),
    heroImageUrl: z.string().trim().optional().default(""),
  }),
});

module.exports = {
  authLoginSchema,
  authRegisterSchema,
  appointmentCreateSchema,
  appointmentStatusSchema,
  appointmentUpdateSchema,
  availabilitySchema,
  gallerySchema,
  serviceSchema,
  settingsSchema,
  slotsQuerySchema,
};
