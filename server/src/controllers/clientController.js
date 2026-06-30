const Client = require("../models/Client");
const Appointment = require("../models/Appointment");
const { ApiError } = require("../utils/apiError");

function buildClientPayload(body) {
  const name = [body.firstName, body.lastName].filter(Boolean).join(" ").trim();

  return {
    ...body,
    name,
    email: body.email || undefined,
    birthday: body.birthday ? new Date(body.birthday) : null,
  };
}

async function getClients(req, res) {
  const now = new Date();
  const search = req.query.search?.trim();
  const match = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { skinConcerns: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const clients = await Client.aggregate([
    { $match: match },
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

async function createClient(req, res) {
  const client = await Client.create(buildClientPayload(req.body));
  res.status(201).json({ client });
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

async function updateClient(req, res) {
  const client = await Client.findByIdAndUpdate(
    req.params.id,
    buildClientPayload(req.body),
    {
      new: true,
      runValidators: true,
    },
  );

  if (!client) {
    throw new ApiError(404, "That client could not be found.");
  }

  res.json({ client });
}

async function deleteClient(req, res) {
  const client = await Client.findById(req.params.id);

  if (!client) {
    throw new ApiError(404, "That client could not be found.");
  }

  await Appointment.updateMany({ clientId: client._id }, { $set: { clientId: null } });
  await Client.findByIdAndDelete(client._id);

  res.status(204).send();
}

module.exports = {
  createClient,
  deleteClient,
  getClient,
  getClients,
  updateClient,
};
