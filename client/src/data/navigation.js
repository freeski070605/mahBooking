import {
  CalendarDays,
  Clock3,
  Images,
  LayoutDashboard,
  Plus,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

export const publicNavigation = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Book", href: "/booking" },
  { label: "Policies", href: "/policies" },
  { label: "Contact", href: "/contact" },
];

export const adminNavigation = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Appointments", href: "/admin/appointments", icon: CalendarDays },
  { label: "Services", href: "/admin/services", icon: Sparkles },
  { label: "Gallery", href: "/admin/gallery", icon: Images },
  { label: "Availability", href: "/admin/availability", icon: Clock3 },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const highlightFeatures = [
  "Editable skin-care service details",
  "Live availability without the back-and-forth",
  "Intake and aftercare notes in one place",
];

export const dashboardQuickActions = [
  {
    label: "Add Service",
    href: "/admin/services",
    icon: Sparkles,
    hint: "Create a service with pricing, timing, intake notes, and an image.",
  },
  {
    label: "Add Customer",
    href: "/admin/clients",
    icon: Plus,
    hint: "Create a customer profile with contact details and skin notes.",
  },
  {
    label: "View Bookings",
    href: "/admin/appointments",
    icon: CalendarDays,
    hint: "Review pending requests, details, intake answers, and statuses.",
  },
];

export const experiencePillars = [
  {
    name: "Skin care first",
    description:
      "Every appointment is grounded in clear skin goals, thoughtful prep, and aftercare that supports the client beyond the visit.",
  },
  {
    name: "Calm from booking to treatment",
    description:
      "Clear timing, easy booking, and thoughtful communication help the full experience feel effortless.",
  },
];

export const brandTagline = {
  title: "Personalized esthetician care with a calm studio rhythm.",
  description:
    "MAH Esti pairs warm beauty branding with flexible service management, intake history, and an easy booking path clients can trust.",
  icon: Sparkles,
};
