import {
  CalendarDays,
  Clock3,
  Grid2x2,
  Images,
  LayoutDashboard,
  Scissors,
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
  { label: "Services", href: "/admin/services", icon: Scissors },
  { label: "Gallery", href: "/admin/gallery", icon: Images },
  { label: "Availability", href: "/admin/availability", icon: Clock3 },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const highlightFeatures = [
  "Healthy hair-first service details",
  "Live availability without the back-and-forth",
  "A calm, polished studio experience",
];

export const dashboardQuickActions = [
  {
    label: "Add Service",
    href: "/admin/services",
    icon: Scissors,
    hint: "Create a new service with pricing, timing, and an image.",
  },
  {
    label: "Upload Gallery",
    href: "/admin/gallery",
    icon: Images,
    hint: "Share finished work with a caption and category.",
  },
  {
    label: "Block Time",
    href: "/admin/availability",
    icon: Clock3,
    hint: "Mark school, travel, or personal time in a few taps.",
  },
  {
    label: "View Calendar",
    href: "/admin/appointments",
    icon: Grid2x2,
    hint: "Check today's appointments and update statuses quickly.",
  },
];

export const experiencePillars = [
  {
    name: "Healthy hair first",
    description:
      "Every appointment is grounded in care, condition, and a finish that keeps your hair looking and feeling its best.",
  },
  {
    name: "Calm from booking to chair",
    description:
      "Clear timing, easy booking, and thoughtful communication help the full experience feel effortless.",
  },
];

export const brandTagline = {
  title: "Healthy hair care, polished styling, and a calm studio rhythm.",
  description:
    "MAH Booking pairs warm beauty branding with clear service details and an easy booking path clients can trust.",
  icon: Sparkles,
};
