const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function createToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      email: user.email,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    },
  );
}

module.exports = { createToken };
