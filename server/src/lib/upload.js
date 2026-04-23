const multer = require("multer");
const { env } = require("../config/env");
const { ApiError } = require("../utils/apiError");

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.uploadMaxFileSizeMb * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(
        new ApiError(
          400,
          "Please upload a JPG, PNG, or WEBP image under the size limit.",
        ),
      );
      return;
    }

    callback(null, true);
  },
});

module.exports = { upload };
