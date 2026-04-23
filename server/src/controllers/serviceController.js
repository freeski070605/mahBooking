const Service = require("../models/Service");
const Appointment = require("../models/Appointment");
const { deleteImage } = require("../lib/cloudinaryService");
const { ApiError } = require("../utils/apiError");

async function getServices(req, res) {
  const query = {};
  const isAdminScope = req.user?.role === "admin" && req.query.scope === "all";

  if (!isAdminScope) {
    query.isActive = true;
  }

  if (req.query.category) {
    query.category = req.query.category;
  }

  const services = await Service.find(query).sort({
    displayOrder: 1,
    createdAt: 1,
  });

  res.json({ services });
}

async function getService(req, res) {
  const service = await Service.findById(req.params.id);

  if (!service) {
    throw new ApiError(404, "That service could not be found.");
  }

  res.json({ service });
}

async function createService(req, res) {
  const service = await Service.create(req.body);
  res.status(201).json({ service });
}

async function updateService(req, res) {
  const existing = await Service.findById(req.params.id);

  if (!existing) {
    throw new ApiError(404, "That service could not be found.");
  }

  const nextImagePublicId = req.body.imagePublicId || "";
  const shouldDeleteOldImage =
    existing.imagePublicId && existing.imagePublicId !== nextImagePublicId;

  const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (shouldDeleteOldImage) {
    await deleteImage(existing.imagePublicId);
  }

  res.json({ service });
}

async function toggleService(req, res) {
  const service = await Service.findById(req.params.id);

  if (!service) {
    throw new ApiError(404, "That service could not be found.");
  }

  service.isActive = !service.isActive;
  await service.save();

  res.json({ service });
}

async function deleteService(req, res) {
  const service = await Service.findById(req.params.id);

  if (!service) {
    throw new ApiError(404, "That service could not be found.");
  }

  const futureAppointment = await Appointment.findOne({
    serviceId: service._id,
    startAt: { $gte: new Date() },
    status: { $in: ["pending", "confirmed"] },
  });

  if (futureAppointment) {
    throw new ApiError(
      409,
      "This service still has upcoming appointments. Deactivate it instead of deleting.",
    );
  }

  await Service.findByIdAndDelete(service._id);
  await deleteImage(service.imagePublicId);

  res.status(204).send();
}

module.exports = {
  createService,
  deleteService,
  getService,
  getServices,
  toggleService,
  updateService,
};
