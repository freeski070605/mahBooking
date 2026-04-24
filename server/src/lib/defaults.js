const defaultBusinessCopy = Object.freeze({
  tagline:
    "Healthy hair, polished finishes, and care that feels calm from start to finish.",
  description:
    "MAH Booking is a warm beauty studio where healthy hair care, refined styling, and thoughtful timing come together in an elevated appointment experience.",
  policies: Object.freeze({
    cancellation:
      "Please cancel or reschedule at least 24 hours before your appointment so that time can be offered to another client.",
    lateness:
      "A 10-minute grace period is built in. After that, your service may need to be adjusted or rescheduled to protect the rest of the day.",
    deposit:
      "If a retainer is required for a service, that detail will be shared before your appointment is confirmed.",
    expectations:
      "Please arrive with hair ready for your selected service unless prep is included. Review any service notes before booking so your visit begins smoothly.",
  }),
  confirmationMessage:
    "Your appointment request is in. You'll receive updates here as soon as it is confirmed.",
});

const legacyPlaceholderCopy = Object.freeze({
  taglines: [
    "Refined beauty appointments, thoughtfully booked.",
    "Luxury care for healthy hair today, skin rituals tomorrow.",
  ],
  descriptions: [
    "MAH Booking is a solo beauty studio experience centered on healthy hair, refined styling, and elevated client care with future-ready room for esthetic services.",
    "A boutique booking experience for a solo beauty professional offering elevated hair services now and esthetician services in the next phase of growth.",
  ],
  cancellations: [
    "Please cancel or reschedule at least 24 hours before your appointment to avoid a cancellation fee.",
  ],
  latenessNotes: [
    "A 10-minute grace period is offered. After that, your service may need to be adjusted or rescheduled.",
  ],
  depositNotes: [
    "Deposit support is included in the platform and can be enabled later as the business grows.",
  ],
  expectationsNotes: [
    "Arrive with detangled hair unless your chosen service includes preparation. Please review your service notes before booking.",
  ],
  confirmationMessages: [
    "Your appointment request has been received. You'll see updates here as it moves from pending to confirmed.",
  ],
});

function buildDefaultWeeklyHours() {
  return [
    {
      dayOfWeek: 0,
      label: "Sunday",
      isOpen: false,
      start: "09:00",
      end: "15:00",
      breaks: [],
    },
    {
      dayOfWeek: 1,
      label: "Monday",
      isOpen: true,
      start: "09:00",
      end: "18:00",
      breaks: [{ start: "13:00", end: "14:00" }],
    },
    {
      dayOfWeek: 2,
      label: "Tuesday",
      isOpen: true,
      start: "09:00",
      end: "18:00",
      breaks: [{ start: "13:00", end: "14:00" }],
    },
    {
      dayOfWeek: 3,
      label: "Wednesday",
      isOpen: true,
      start: "10:00",
      end: "19:00",
      breaks: [{ start: "14:00", end: "15:00" }],
    },
    {
      dayOfWeek: 4,
      label: "Thursday",
      isOpen: true,
      start: "09:00",
      end: "18:00",
      breaks: [{ start: "13:00", end: "14:00" }],
    },
    {
      dayOfWeek: 5,
      label: "Friday",
      isOpen: true,
      start: "08:00",
      end: "17:00",
      breaks: [{ start: "12:30", end: "13:15" }],
    },
    {
      dayOfWeek: 6,
      label: "Saturday",
      isOpen: true,
      start: "08:00",
      end: "15:00",
      breaks: [],
    },
  ];
}

function buildDefaultBusinessSettings() {
  return {
    key: "default",
    businessName: "MAH Booking",
    tagline: defaultBusinessCopy.tagline,
    description: defaultBusinessCopy.description,
    contactEmail: "hello@mahbooking.com",
    contactPhone: "(555) 274-5612",
    address: "Atlanta, GA",
    policies: {
      ...defaultBusinessCopy.policies,
    },
    socialLinks: {
      instagram: "https://instagram.com/mahbooking",
      facebook: "",
      tiktok: "",
    },
    bookingSettings: {
      allowClientCancelHours: 24,
      allowClientRescheduleHours: 24,
      bookingWindowDays: 60,
      advanceNoticeHours: 2,
      confirmationMessage: defaultBusinessCopy.confirmationMessage,
    },
    branding: {
      primaryColor: "#e7792d",
      accentColor: "#f2c7a5",
      neutralColor: "#f7efe8",
      logoUrl: "",
      heroImageUrl:
        "https://placehold.co/1440x1600/f3e9df/2f2622?text=MAH+Booking",
    },
  };
}

async function refreshLegacyBusinessCopy(settings) {
  if (!settings) {
    return settings;
  }

  const defaults = buildDefaultBusinessSettings();
  let changed = false;

  if (!settings.policies) {
    settings.policies = {};
  }

  if (!settings.bookingSettings) {
    settings.bookingSettings = {};
  }

  if (legacyPlaceholderCopy.taglines.includes(settings.tagline)) {
    settings.tagline = defaults.tagline;
    changed = true;
  }

  if (legacyPlaceholderCopy.descriptions.includes(settings.description)) {
    settings.description = defaults.description;
    changed = true;
  }

  if (legacyPlaceholderCopy.cancellations.includes(settings.policies.cancellation)) {
    settings.policies.cancellation = defaults.policies.cancellation;
    changed = true;
  }

  if (legacyPlaceholderCopy.latenessNotes.includes(settings.policies.lateness)) {
    settings.policies.lateness = defaults.policies.lateness;
    changed = true;
  }

  if (legacyPlaceholderCopy.depositNotes.includes(settings.policies.deposit)) {
    settings.policies.deposit = defaults.policies.deposit;
    changed = true;
  }

  if (legacyPlaceholderCopy.expectationsNotes.includes(settings.policies.expectations)) {
    settings.policies.expectations = defaults.policies.expectations;
    changed = true;
  }

  if (
    legacyPlaceholderCopy.confirmationMessages.includes(
      settings.bookingSettings.confirmationMessage,
    )
  ) {
    settings.bookingSettings.confirmationMessage =
      defaults.bookingSettings.confirmationMessage;
    changed = true;
  }

  if (changed) {
    await settings.save();
  }

  return settings;
}

module.exports = {
  buildDefaultWeeklyHours,
  buildDefaultBusinessSettings,
  refreshLegacyBusinessCopy,
};
