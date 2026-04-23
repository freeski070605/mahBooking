const dayjs = require("dayjs");
const Appointment = require("../models/Appointment");
const Client = require("../models/Client");
const Service = require("../models/Service");
const { ensureAvailability, ensureBusinessSettings } = require("../lib/singletons");
const { ApiError } = require("../utils/apiError");
const { findSlotMatch, generateAvailableSlots } = require("../utils/booking");
const {
  BLOCKING_APPOINTMENT_STATUSES,
} = require("../utils/constants");

function getAppointmentOwnerFilter(user) {
  return {
    $or: [{ userId: user._id }, { clientEmail: user.email }],
  };
}

async function syncClientProfile({
  userId,
  name,
  email,
  phone,
  notes,
  internalNotes,
  status,
  startAt,
}) {
  const increment = status === "no-show" ? { noShowCount: 1 } : null;
  const update = {
    name,
    email,
    phone,
    lastAppointmentAt: startAt,
  };

  if (notes !== undefined) {
    update.notes = notes;
  }

  if (internalNotes !== undefined) {
    update.internalNotes = internalNotes;
  }

  if (increment) {
    update.isFlagged = true;
  }

  const client = await Client.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $set: {
        ...update,
        userId: userId || null,
      },
      ...(increment ? { $inc: increment } : {}),
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return client;
}

async function resolveServiceSnapshot(serviceId, options = {}) {
  const { allowInactive = false } = options;
  const service = await Service.findById(serviceId);

  if (!service || (!service.isActive && !allowInactive)) {
    throw new ApiError(
      400,
      "That service is no longer available for booking. Please choose another one.",
    );
  }

  return {
    service,
    snapshot: {
      name: service.name,
      category: service.category,
      price: service.price,
      durationMinutes: service.durationMinutes,
      bufferMinutes: service.bufferMinutes,
      imageUrl: service.imageUrl,
    },
  };
}

async function getAppointments(req, res) {
  const query = {};

  if (req.user.role !== "admin") {
    Object.assign(query, getAppointmentOwnerFilter(req.user));
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  if (req.query.date) {
    query.appointmentDate = req.query.date;
  }

  if (req.query.from || req.query.to) {
    query.startAt = {};

    if (req.query.from) {
      query.startAt.$gte = new Date(req.query.from);
    }

    if (req.query.to) {
      query.startAt.$lte = new Date(req.query.to);
    }
  }

  const appointments = await Appointment.find(query)
    .sort({ startAt: 1 })
    .populate("serviceId", "name category price durationMinutes");

  res.json({ appointments });
}

async function getAppointment(req, res) {
  const appointment = await Appointment.findById(req.params.id).populate(
    "serviceId",
    "name category price durationMinutes",
  );

  if (!appointment) {
    throw new ApiError(404, "That appointment could not be found.");
  }

  if (
    req.user.role !== "admin" &&
    String(appointment.userId) !== String(req.user._id) &&
    appointment.clientEmail !== req.user.email
  ) {
    throw new ApiError(403, "You can only view your own appointments.");
  }

  res.json({ appointment });
}

async function getAvailableSlots(req, res) {
  const { serviceId, date } = req.query;
  const isAdminRequest = req.user?.role === "admin";
  const availability = await ensureAvailability();
  const settings = await ensureBusinessSettings();
  const { service } = await resolveServiceSnapshot(serviceId, {
    allowInactive: isAdminRequest,
  });

  const bookingWindowDays =
    availability.bookingWindowDays || settings.bookingSettings.bookingWindowDays;
  const advanceNoticeHours =
    availability.advanceNoticeHours ||
    settings.bookingSettings.advanceNoticeHours;

  const selectedDate = dayjs(date);
  const today = dayjs().startOf("day");
  const lastBookableDate = today.add(bookingWindowDays, "day");

  if (
    !isAdminRequest &&
    (selectedDate.isBefore(today) || selectedDate.isAfter(lastBookableDate))
  ) {
    res.json({ slots: [] });
    return;
  }

  const appointments = await Appointment.find({
    appointmentDate: date,
    status: { $in: BLOCKING_APPOINTMENT_STATUSES },
  });

  const slots = generateAvailableSlots({
    availability,
    appointments,
    date,
    service,
    timezoneName: availability.timezone,
  }).filter((slot) =>
    isAdminRequest
      ? true
      : dayjs(slot.startAt).diff(dayjs(), "hour", true) >= advanceNoticeHours,
  );

  res.json({
    date,
    timezone: availability.timezone,
    service: {
      id: service._id,
      name: service.name,
      durationMinutes: service.durationMinutes,
      bufferMinutes: service.bufferMinutes,
    },
    slots,
  });
}

async function createAppointment(req, res) {
  const isAdminRequest = req.user?.role === "admin";
  const {
    clientName,
    clientEmail,
    clientPhone,
    serviceId,
    date,
    startTime,
    notes,
    internalNotes,
    status,
  } = req.body;
  const availability = await ensureAvailability();
  const { service, snapshot } = await resolveServiceSnapshot(serviceId, {
    allowInactive: isAdminRequest,
  });

  const appointments = await Appointment.find({
    appointmentDate: date,
    status: { $in: BLOCKING_APPOINTMENT_STATUSES },
  });

  const slot = findSlotMatch({
    availability,
    appointments,
    date,
    service,
    startTime,
    timezoneName: availability.timezone,
  });

  if (!slot) {
    throw new ApiError(
      409,
      "That time is no longer available. Please choose a different slot.",
    );
  }

  const overlap = await Appointment.findOne({
    appointmentDate: date,
    status: { $in: BLOCKING_APPOINTMENT_STATUSES },
    startAt: { $lt: slot.bufferEndAt },
    bufferEndAt: { $gt: slot.startAt },
  });

  if (overlap) {
    throw new ApiError(
      409,
      "That time has just been taken. Please choose another one.",
    );
  }

  const client = await syncClientProfile({
    userId: req.user?._id || null,
    name: clientName,
    email: clientEmail,
    phone: clientPhone,
    notes,
    internalNotes: isAdminRequest ? internalNotes : undefined,
    status: isAdminRequest ? status : undefined,
    startAt: slot.startAt,
  });

  const appointment = await Appointment.create({
    clientId: client._id,
    userId: req.user?._id || null,
    clientName,
    clientEmail,
    clientPhone,
    serviceId: service._id,
    serviceSnapshot: snapshot,
    date: dayjs(date).startOf("day").toDate(),
    appointmentDate: date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    startAt: slot.startAt,
    endAt: slot.endAt,
    bufferEndAt: slot.bufferEndAt,
    status: isAdminRequest ? status || "confirmed" : "pending",
    notes,
    internalNotes: isAdminRequest ? internalNotes || "" : "",
    source: isAdminRequest ? "admin" : "client",
  });

  res.status(201).json({ appointment });
}

async function updateAppointment(req, res) {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new ApiError(404, "That appointment could not be found.");
  }

  const isAdmin = req.user.role === "admin";
  const isOwner =
    String(appointment.userId) === String(req.user._id) ||
    appointment.clientEmail === req.user.email;

  if (!isAdmin && !isOwner) {
    throw new ApiError(403, "You can only update your own appointments.");
  }

  const settings = await ensureBusinessSettings();
  const isRescheduling =
    req.body.date || req.body.startTime || req.body.serviceId;
  const isCanceling = req.body.status === "canceled";

  if (!isAdmin) {
    const hoursUntilAppointment = dayjs(appointment.startAt).diff(
      dayjs(),
      "hour",
      true,
    );

    if (
      isRescheduling &&
      hoursUntilAppointment < settings.bookingSettings.allowClientRescheduleHours
    ) {
      throw new ApiError(
        403,
        "This appointment is too close to start time to reschedule online.",
      );
    }

    if (
      isCanceling &&
      hoursUntilAppointment < settings.bookingSettings.allowClientCancelHours
    ) {
      throw new ApiError(
        403,
        "This appointment is too close to start time to cancel online.",
      );
    }
  }

  let nextService = null;
  let nextSnapshot = appointment.serviceSnapshot;

  if (req.body.serviceId) {
    const resolved = await resolveServiceSnapshot(req.body.serviceId, {
      allowInactive: isAdmin,
    });
    nextService = resolved.service;
    nextSnapshot = resolved.snapshot;
  } else {
    nextService = await Service.findById(appointment.serviceId);
  }

  if (isRescheduling) {
    const date = req.body.date || appointment.appointmentDate;
    const startTime = req.body.startTime || appointment.startTime;
    const availability = await ensureAvailability();
    const appointments = await Appointment.find({
      appointmentDate: date,
      status: { $in: BLOCKING_APPOINTMENT_STATUSES },
      _id: { $ne: appointment._id },
    });

    const slot = findSlotMatch({
      availability,
      appointments,
      date,
      service: nextService,
      startTime,
      timezoneName: availability.timezone,
    });

    if (!slot) {
      throw new ApiError(
        409,
        "That new time isn't available anymore. Please choose another slot.",
      );
    }

    appointment.date = dayjs(date).startOf("day").toDate();
    appointment.appointmentDate = date;
    appointment.startTime = slot.startTime;
    appointment.endTime = slot.endTime;
    appointment.startAt = slot.startAt;
    appointment.endAt = slot.endAt;
    appointment.bufferEndAt = slot.bufferEndAt;
  }

  if (req.body.serviceId) {
    appointment.serviceId = nextService._id;
    appointment.serviceSnapshot = nextSnapshot;
  }

  if (req.body.clientName) {
    appointment.clientName = req.body.clientName;
  }
  if (req.body.clientEmail) {
    appointment.clientEmail = req.body.clientEmail;
  }
  if (req.body.clientPhone) {
    appointment.clientPhone = req.body.clientPhone;
  }
  if (req.body.notes !== undefined) {
    appointment.notes = req.body.notes;
  }
  if (isAdmin && req.body.internalNotes !== undefined) {
    appointment.internalNotes = req.body.internalNotes;
  }
  if (req.body.status) {
    appointment.status = req.body.status;
  }

  await appointment.save();

  await syncClientProfile({
    userId: appointment.userId,
    name: appointment.clientName,
    email: appointment.clientEmail,
    phone: appointment.clientPhone,
    notes: appointment.notes,
    internalNotes: appointment.internalNotes,
    status: appointment.status,
    startAt: appointment.startAt,
  });

  res.json({ appointment });
}

async function updateAppointmentStatus(req, res) {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new ApiError(404, "That appointment could not be found.");
  }

  appointment.status = req.body.status;
  await appointment.save();

  await syncClientProfile({
    userId: appointment.userId,
    name: appointment.clientName,
    email: appointment.clientEmail,
    phone: appointment.clientPhone,
    notes: appointment.notes,
    internalNotes: appointment.internalNotes,
    status: appointment.status,
    startAt: appointment.startAt,
  });

  res.json({ appointment });
}

async function deleteAppointment(req, res) {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new ApiError(404, "That appointment could not be found.");
  }

  await Appointment.findByIdAndDelete(appointment._id);
  res.status(204).send();
}

module.exports = {
  createAppointment,
  deleteAppointment,
  getAppointment,
  getAppointments,
  getAvailableSlots,
  updateAppointment,
  updateAppointmentStatus,
};
