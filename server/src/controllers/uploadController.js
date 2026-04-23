const { uploadImageBuffer } = require("../lib/cloudinaryService");
const { resolveUploadFolder } = require("../lib/uploadFolders");
const { ApiError } = require("../utils/apiError");

async function uploadImage(req, res) {
  if (!req.file?.buffer) {
    throw new ApiError(400, "Please choose an image before uploading.");
  }

  const folder = resolveUploadFolder(req.body.type);
  const result = await uploadImageBuffer(req.file.buffer, folder);

  res.status(201).json({
    imageUrl: result.secure_url,
    imagePublicId: result.public_id,
  });
}

module.exports = { uploadImage };
