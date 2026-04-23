const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Client = require("../models/Client");
const { cookieOptions } = require("../config/env");
const { createToken } = require("../lib/token");
const { ApiError } = require("../utils/apiError");
const { sanitizeUser } = require("../utils/sanitize");

async function register(req, res) {
  const { name, email, phone, password, role } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "An account with that email already exists.");
  }

  const adminCount = await User.countDocuments({ role: "admin" });
  const nextRole = role === "admin" && adminCount === 0 ? "admin" : "client";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    phone,
    passwordHash,
    role: nextRole,
  });

  await Client.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $set: {
        name,
        email,
        phone,
        userId: user._id,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const token = createToken(user);
  res.cookie("mah_booking_token", token, cookieOptions);

  res.status(201).json({
    user: sanitizeUser(user),
    token,
  });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    throw new ApiError(401, "We couldn't match that email and password.");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new ApiError(401, "We couldn't match that email and password.");
  }

  const token = createToken(user);
  res.cookie("mah_booking_token", token, cookieOptions);

  res.json({
    user: sanitizeUser(user),
    token,
  });
}

async function logout(_req, res) {
  res.clearCookie("mah_booking_token", cookieOptions);
  res.status(204).send();
}

async function me(req, res) {
  res.json({
    user: sanitizeUser(req.user),
  });
}

module.exports = { register, login, logout, me };
