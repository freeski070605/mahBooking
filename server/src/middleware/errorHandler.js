const { ApiError } = require("../utils/apiError");

function errorHandler(error, _req, res, _next) {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details || null,
    });
    return;
  }

  if (error?.name === "ValidationError") {
    res.status(400).json({
      message: "Please review the highlighted information and try again.",
      details: error.errors,
    });
    return;
  }

  if (error?.name === "CastError") {
    res.status(400).json({
      message: "That record could not be found with the provided information.",
    });
    return;
  }

  if (error?.name === "MulterError") {
    res.status(400).json({
      message: error.message,
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    message: "Something went wrong on our side. Please try again.",
  });
}

module.exports = { errorHandler };
