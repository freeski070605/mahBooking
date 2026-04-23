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
    tagline: "Refined beauty appointments, thoughtfully booked.",
    description:
      "MAH Booking is a solo beauty studio experience centered on healthy hair, refined styling, and elevated client care with future-ready room for esthetic services.",
    contactEmail: "hello@mahbooking.com",
    contactPhone: "(555) 274-5612",
    address: "Atlanta, Georgia",
    policies: {
      cancellation:
        "Please cancel or reschedule at least 24 hours before your appointment to avoid a cancellation fee.",
      lateness:
        "A 10-minute grace period is offered. After that, your service may need to be adjusted or rescheduled.",
      deposit:
        "Deposit support is included in the platform and can be enabled later as the business grows.",
      expectations:
        "Arrive with detangled hair unless your chosen service includes preparation. Please review your service notes before booking.",
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
      confirmationMessage:
        "Your appointment request has been received. You'll see updates here as it moves from pending to confirmed.",
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

module.exports = {
  buildDefaultWeeklyHours,
  buildDefaultBusinessSettings,
};
