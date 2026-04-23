const { ZodError } = require("zod");
const { ApiError } = require("../utils/apiError");

function validate(schema, property = "body") {
  return (req, _res, next) => {
    try {
      req[property] = schema.parse(req[property]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new ApiError(
            400,
            "Some of the information looks incomplete.",
            error.flatten(),
          ),
        );
        return;
      }

      next(error);
    }
  };
}

module.exports = { validate };
