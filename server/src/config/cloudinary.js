const cloudinary = require("cloudinary").v2;
const { env } = require("./env");

const hasCloudinaryConfig = Boolean(
  env.cloudinaryCloudName &&
    env.cloudinaryApiKey &&
    env.cloudinaryApiSecret,
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });
}

module.exports = { cloudinary, hasCloudinaryConfig };
