const GalleryItem = require("../models/GalleryItem");
const { deleteImage } = require("../lib/cloudinaryService");
const { ApiError } = require("../utils/apiError");

async function getGallery(req, res) {
  const query = {};
  if (req.query.category) {
    query.category = req.query.category;
  }
  if (req.query.featured === "true") {
    query.isFeatured = true;
  }

  const gallery = await GalleryItem.find(query).sort({
    displayOrder: 1,
    createdAt: -1,
  });

  res.json({ gallery });
}

async function createGalleryItem(req, res) {
  const item = await GalleryItem.create(req.body);
  res.status(201).json({ item });
}

async function updateGalleryItem(req, res) {
  const existing = await GalleryItem.findById(req.params.id);

  if (!existing) {
    throw new ApiError(404, "That gallery item could not be found.");
  }

  const nextImagePublicId = req.body.imagePublicId || "";
  const shouldDeleteOldImage =
    existing.imagePublicId && existing.imagePublicId !== nextImagePublicId;

  const item = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (shouldDeleteOldImage) {
    await deleteImage(existing.imagePublicId);
  }

  res.json({ item });
}

async function deleteGalleryItem(req, res) {
  const item = await GalleryItem.findById(req.params.id);

  if (!item) {
    throw new ApiError(404, "That gallery item could not be found.");
  }

  await GalleryItem.findByIdAndDelete(item._id);
  await deleteImage(item.imagePublicId);

  res.status(204).send();
}

module.exports = {
  createGalleryItem,
  deleteGalleryItem,
  getGallery,
  updateGalleryItem,
};
