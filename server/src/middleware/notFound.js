const { ApiError } = require("../utils/apiError");

function notFound(req, _res, next) {
  next(new ApiError(404, `We couldn't find ${req.originalUrl}.`));
}

module.exports = { notFound };
