import { clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatServicePrice(service) {
  if (service?.priceType === "tbd") {
    return "TBD";
  }

  const price = formatCurrency(service?.price || 0);

  if (service?.priceType === "starting_at") {
    return `Starting at ${price}`;
  }

  return price;
}

export function getInstagramUrl(value = "") {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const handle = trimmed
    .replace(/^@/, "")
    .replace(/^www\.instagram\.com\//i, "")
    .replace(/^instagram\.com\//i, "")
    .replace(/^\/+|\/+$/g, "");

  return handle ? `https://www.instagram.com/${handle}` : "";
}

export function getInstagramLabel(value = "") {
  const trimmed = value.trim();
  const handle = trimmed
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^www\.instagram\.com\//i, "")
    .replace(/^instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/^\/+|\/+$/g, "");

  return handle ? `@${handle}` : trimmed;
}

export function formatDuration(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs && mins) {
    return `${hrs} hr ${mins} min`;
  }

  if (hrs) {
    return `${hrs} hr`;
  }

  return `${mins} min`;
}

export function formatLongDate(date) {
  return format(new Date(date), "EEEE, MMMM d");
}

export function formatShortDate(date) {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatTimeLabel(date) {
  return format(new Date(date), "h:mm a");
}

export function formatAppointmentLabel(date) {
  return format(new Date(date), "EEE, MMM d • h:mm a");
}

export function groupAppointmentsByDate(appointments = []) {
  return appointments.reduce((groups, appointment) => {
    const key = appointment.appointmentDate;
    groups[key] = groups[key] || [];
    groups[key].push(appointment);
    return groups;
  }, {});
}

export function buildInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function getStatusTone(status) {
  const tones = {
    pending: "amber",
    confirmed: "emerald",
    completed: "stone",
    canceled: "rose",
    "no-show": "slate",
  };

  return tones[status] || "stone";
}

export function uniqueValues(items = [], key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))];
}

export function getErrorMessage(error, fallback = "Something went wrong.") {
  return error?.response?.data?.message || error?.message || fallback;
}
