const { env } = require("../config/env");
const { ApiError } = require("../utils/apiError");

const uploadFolderMap = {
  general: env.cloudinaryRootFolder,
  service: env.cloudinaryServiceFolder,
  gallery: env.cloudinaryGalleryFolder,
  branding: env.cloudinaryBrandingFolder,
};

function resolveUploadFolder(type = "general") {
  const normalizedType = String(type || "general").trim().toLowerCase();
  const folder = uploadFolderMap[normalizedType];

  if (!folder) {
    throw new ApiError(
      400,
      "That upload type is not supported for Cloudinary storage.",
    );
  }

  return folder;
}

module.exports = { resolveUploadFolder };
