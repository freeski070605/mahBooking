const { env } = require("../config/env");
const { sendEmail } = require("./emailService");

function adminRecipients() {
  return env.bookingNotificationEmails
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

function formatAppointmentTime(appointment) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: env.defaultTimezone,
  }).format(new Date(appointment.startAt));
}

function priceLabel(snapshot = {}) {
  if (snapshot.priceType === "tbd") {
    return "TBD";
  }

  const price = Number(snapshot.price || 0);
  const formattedPrice = `$${price}`;

  if (snapshot.priceType === "starting_at") {
    return `Starting at ${formattedPrice}`;
  }

  return formattedPrice;
}

function intakeSummary(appointment) {
  const answers = appointment.intakeAnswers || {};
  const lines = [
    ["First-time client", answers.firstTimeClient],
    ["Skin type", answers.skinType],
    ["Skin concerns", answers.skinConcerns],
    ["Allergies", answers.allergies],
    ["Retinol use", answers.retinolUse],
    ["Accutane use", answers.accutaneUse],
    ["Recent waxing", answers.recentWaxing],
    ["Recent chemical peels", answers.recentChemicalPeels],
    ["Pregnancy status", answers.pregnancyStatus],
    ["Appointment goals", answers.appointmentGoals],
    ["Notes", answers.notes || appointment.notes],
  ];

  return lines
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim())
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

function bookingDetails(appointment) {
  return [
    `Client: ${appointment.clientName}`,
    `Email: ${appointment.clientEmail}`,
    `Phone: ${appointment.clientPhone}`,
    `Service: ${appointment.serviceSnapshot?.name || "Service"}`,
    `When: ${formatAppointmentTime(appointment)}`,
    `Duration: ${appointment.serviceSnapshot?.durationMinutes || appointment.durationMinutes || ""} minutes`,
    `Price: ${priceLabel(appointment.serviceSnapshot)}`,
    `Status: ${appointment.status}`,
  ]
    .filter((line) => !line.endsWith(": "))
    .join("\n");
}

async function settleNotifications(messages) {
  const results = await Promise.allSettled(messages.map((message) => sendEmail(message)));
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("Booking email failed:", result.reason?.message || result.reason);
    }
  });
}

async function sendBookingCreatedNotifications(appointment) {
  const details = bookingDetails(appointment);
  const when = formatAppointmentTime(appointment);
  const serviceName = appointment.serviceSnapshot?.name || "your service";
  const intake = intakeSummary(appointment);

  await settleNotifications([
    {
      to: appointment.clientEmail,
      subject: "MAH Esti booking request received",
      text: [
        `Hi ${appointment.clientName},`,
        "",
        `Your booking request for ${serviceName} was received.`,
        `Requested time: ${when}`,
        "",
        "You will receive another update once the appointment is confirmed.",
        "",
        "Thank you,",
        "MAH Esti",
      ].join("\n"),
    },
    {
      to: adminRecipients(),
      subject: `New MAH Esti booking request: ${appointment.clientName}`,
      text: [details, intake ? `\nIntake answers:\n${intake}` : ""].filter(Boolean).join("\n"),
    },
  ]);
}

async function sendBookingConfirmedNotifications(appointment) {
  const details = bookingDetails(appointment);
  const when = formatAppointmentTime(appointment);
  const serviceName = appointment.serviceSnapshot?.name || "your service";

  await settleNotifications([
    {
      to: appointment.clientEmail,
      subject: "Your MAH Esti appointment is confirmed",
      text: [
        `Hi ${appointment.clientName},`,
        "",
        `Your appointment for ${serviceName} is confirmed.`,
        `Appointment time: ${when}`,
        "",
        "Thank you,",
        "MAH Esti",
      ].join("\n"),
    },
    {
      to: adminRecipients(),
      subject: `MAH Esti appointment confirmed: ${appointment.clientName}`,
      text: details,
    },
  ]);
}

module.exports = {
  sendBookingConfirmedNotifications,
  sendBookingCreatedNotifications,
};
