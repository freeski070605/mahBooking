const { cloudinary, hasCloudinaryConfig } = require("../config/cloudinary");
const { ApiError } = require("../utils/apiError");

async function uploadImageBuffer(buffer, folder = "mah-booking") {
  if (!hasCloudinaryConfig) {
    throw new ApiError(
      500,
      "Cloudinary is not configured. Add your Cloudinary credentials before uploading images.",
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(
            new ApiError(500, "We couldn't upload that image right now.", error),
          );
          return;
        }

        resolve(result);
      },
    );

    stream.end(buffer);
  });
}

async function deleteImage(publicId) {
  if (!publicId || !hasCloudinaryConfig) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
}

module.exports = { uploadImageBuffer, deleteImage };
