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
  { label: "Booking", href: "/booking" },
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
  "Smooth mobile booking flow",
  "Built for solo beauty professionals",
  "Future-ready for esthetician services",
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

export const testimonials = [
  {
    name: "Client experience",
    quote:
      "A luxury service should start long before the appointment itself. This flow feels calm, polished, and easy.",
  },
  {
    name: "Brand presence",
    quote:
      "Everything is designed to look elevated, warm, and intentional without feeling overdone.",
  },
];

export const brandTagline = {
  title: "Luxury care for healthy hair today, skin rituals tomorrow.",
  description:
    "MAH Booking blends polished beauty branding with a booking flow made for real clients and a dashboard gentle enough for a first-time business owner.",
  icon: Sparkles,
};
