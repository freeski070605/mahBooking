const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const {
  BLOCKING_APPOINTMENT_STATUSES,
} = require("./constants");

dayjs.extend(utc);
dayjs.extend(timezone);

function parseTimeToMinutes(time) {
  const [hours, minutes] = String(time || "00:00")
    .split(":")
    .map((value) => Number(value));
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function buildDateTime(date, time, timezoneName) {
  return dayjs.tz(`${date} ${time}`, "YYYY-MM-DD HH:mm", timezoneName);
}

function getWeeklyDayConfig(availability, date) {
  const weekday = dayjs(date).day();
  return availability.weeklyHours.find((day) => day.dayOfWeek === weekday);
}

function getOverrideConfig(availability, date) {
  return availability.dateOverrides.find((item) => item.date === date);
}

function resolveScheduleForDate(availability, date) {
  const override = getOverrideConfig(availability, date);

  if (override) {
    return {
      isOpen: override.isOpen,
      start: override.start,
      end: override.end,
      breaks: override.breaks || [],
    };
  }

  const weekly = getWeeklyDayConfig(availability, date);

  if (!weekly) {
    return {
      isOpen: false,
      start: "09:00",
      end: "17:00",
      breaks: [],
    };
  }

  return weekly;
}

function resolveBlockedRanges(availability, date) {
  return (availability.blockedDates || [])
    .filter((item) => item.date === date)
    .map((item) => {
      if (item.allDay) {
        return { start: 0, end: 24 * 60 };
      }

      return {
        start: parseTimeToMinutes(item.start),
        end: parseTimeToMinutes(item.end),
      };
    });
}

function normalizeAppointments(appointments, timezoneName) {
  return appointments
    .filter((item) => BLOCKING_APPOINTMENT_STATUSES.includes(item.status))
    .map((item) => {
      const startTime =
        item.startTime ||
        dayjs(item.startAt).tz(timezoneName).format("HH:mm");
      const endTime =
        item.endTime || dayjs(item.endAt).tz(timezoneName).format("HH:mm");
      const bufferEndTime =
        item.bufferEndAt
          ? dayjs(item.bufferEndAt).tz(timezoneName).format("HH:mm")
          : endTime;

      return {
        start: parseTimeToMinutes(startTime),
        end: parseTimeToMinutes(endTime),
        blockEnd: parseTimeToMinutes(bufferEndTime),
      };
    });
}

function hasRangeConflict(slotStart, slotEnd, ranges) {
  return ranges.some((range) => overlaps(slotStart, slotEnd, range.start, range.end));
}

function generateAvailableSlots({
  availability,
  appointments,
  date,
  service,
  timezoneName,
}) {
  const schedule = resolveScheduleForDate(availability, date);

  if (!schedule?.isOpen) {
    return [];
  }

  const serviceDuration = Number(service.durationMinutes);
  const totalBlockDuration =
    Number(service.durationMinutes) + Number(service.bufferMinutes || 0);
  const slotInterval = Number(availability.slotIntervalMinutes) || 15;
  const workdayStart = parseTimeToMinutes(schedule.start);
  const workdayEnd = parseTimeToMinutes(schedule.end);
  const breaks = (schedule.breaks || []).map((item) => ({
    start: parseTimeToMinutes(item.start),
    end: parseTimeToMinutes(item.end),
  }));
  const blockedRanges = resolveBlockedRanges(availability, date);
  const appointmentRanges = normalizeAppointments(appointments, timezoneName).map(
    (item) => ({
      start: item.start,
      end: item.blockEnd,
    }),
  );

  const slots = [];

  for (
    let cursor = workdayStart;
    cursor + totalBlockDuration <= workdayEnd;
    cursor += slotInterval
  ) {
    const serviceEnd = cursor + serviceDuration;
    const blockEnd = cursor + totalBlockDuration;

    const conflictsWithBreak = hasRangeConflict(cursor, blockEnd, breaks);
    const conflictsWithBlockedTime = hasRangeConflict(
      cursor,
      blockEnd,
      blockedRanges,
    );
    const conflictsWithAppointment = hasRangeConflict(
      cursor,
      blockEnd,
      appointmentRanges,
    );

    if (
      conflictsWithBreak ||
      conflictsWithBlockedTime ||
      conflictsWithAppointment
    ) {
      continue;
    }

    slots.push({
      startTime: minutesToTime(cursor),
      endTime: minutesToTime(serviceEnd),
      blockEndTime: minutesToTime(blockEnd),
      startAt: buildDateTime(date, minutesToTime(cursor), timezoneName).toDate(),
      endAt: buildDateTime(date, minutesToTime(serviceEnd), timezoneName).toDate(),
      bufferEndAt: buildDateTime(
        date,
        minutesToTime(blockEnd),
        timezoneName,
      ).toDate(),
    });
  }

  return slots;
}

function findSlotMatch({ availability, appointments, date, service, startTime, timezoneName }) {
  const slots = generateAvailableSlots({
    availability,
    appointments,
    date,
    service,
    timezoneName,
  });

  return slots.find((slot) => slot.startTime === startTime) || null;
}

module.exports = {
  buildDateTime,
  findSlotMatch,
  generateAvailableSlots,
  minutesToTime,
  overlaps,
  parseTimeToMinutes,
  resolveScheduleForDate,
};
