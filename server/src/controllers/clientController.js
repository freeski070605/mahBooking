const Client = require("../models/Client");
const Appointment = require("../models/Appointment");
const { ApiError } = require("../utils/apiError");

async function getClients(_req, res) {
  const now = new Date();
  const clients = await Client.aggregate([
    {
      $lookup: {
        from: "appointments",
        localField: "_id",
        foreignField: "clientId",
        as: "appointments",
      },
    },
    {
      $addFields: {
        appointmentCount: { $size: "$appointments" },
        upcomingCount: {
          $size: {
            $filter: {
              input: "$appointments",
              as: "appointment",
              cond: {
                $and: [
                  { $gte: ["$$appointment.startAt", now] },
                  { $ne: ["$$appointment.status", "canceled"] },
                ],
              },
            },
          },
        },
        lastAppointmentAt: { $max: "$appointments.startAt" },
      },
    },
    {
      $project: {
        appointments: 0,
      },
    },
    {
      $sort: {
        lastAppointmentAt: -1,
        createdAt: -1,
      },
    },
  ]);

  res.json({ clients });
}

async function getClient(req, res) {
  const client = await Client.findById(req.params.id);

  if (!client) {
    throw new ApiError(404, "That client could not be found.");
  }

  const appointments = await Appointment.find({ clientId: client._id }).sort({
    startAt: -1,
  });

  res.json({ client, appointments });
}

module.exports = { getClient, getClients };
