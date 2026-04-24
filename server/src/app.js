require("express-async-errors");

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const apiRoutes = require("./routes");
const { env } = require("./config/env");
const { hydrateUser } = require("./middleware/auth");
const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

function normalizeOrigin(value) {
  return value.trim().replace(/\/+$/, "");
}

const allowedOrigins = env.frontendUrl
  .split(",")
  .map((item) => normalizeOrigin(item))
  .filter(Boolean);

if (env.nodeEnv === "production") {
  app.set("trust proxy", 1);
}

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      const requestOrigin = normalizeOrigin(origin);

      if (allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
        return;
      }

      console.warn(`Blocked by CORS: ${requestOrigin}`);
      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(hydrateUser);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, app: "MAH Booking API" });
});

app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
