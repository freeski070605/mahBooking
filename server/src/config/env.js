const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const cloudinaryRootFolder =
  process.env.CLOUDINARY_ROOT_FOLDER || "mah-booking";

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  mongoUri:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mah-booking",
  jwtSecret: process.env.JWT_SECRET || "replace-me-with-a-real-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  defaultTimezone: process.env.DEFAULT_TIMEZONE || "America/New_York",
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  cloudinaryRootFolder,
  cloudinaryServiceFolder:
    process.env.CLOUDINARY_SERVICE_FOLDER || `${cloudinaryRootFolder}/services`,
  cloudinaryGalleryFolder:
    process.env.CLOUDINARY_GALLERY_FOLDER || `${cloudinaryRootFolder}/gallery`,
  cloudinaryBrandingFolder:
    process.env.CLOUDINARY_BRANDING_FOLDER || `${cloudinaryRootFolder}/branding`,
  uploadMaxFileSizeMb: Number(process.env.UPLOAD_MAX_FILE_SIZE_MB) || 5,
  seedAdminEmail:
    process.env.SEED_ADMIN_EMAIL || "owner@mahbooking.com",
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || "MahBooking123!",
};

const cookieOptions = {
  httpOnly: true,
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  secure: env.nodeEnv === "production",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

module.exports = { env, cookieOptions };
