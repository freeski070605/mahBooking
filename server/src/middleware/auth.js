const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { env } = require("../config/env");
const { ApiError } = require("../utils/apiError");

function extractToken(req) {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return req.cookies?.mah_booking_token || null;
}

async function hydrateUser(req, _res, next) {
  const token = extractToken(req);

  if (!token) {
    req.user = null;
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);
    req.user = user || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
}

function requireAuth(req, _res, next) {
  if (!req.user) {
    next(new ApiError(401, "Please sign in to continue."));
    return;
  }

  next();
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      next(new ApiError(401, "Please sign in to continue."));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ApiError(403, "You do not have permission for that action."));
      return;
    }

    next();
  };
}

module.exports = { hydrateUser, requireAuth, requireRole };
